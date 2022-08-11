#!/usr/bin/env node

const { spawn } = require('child_process')
const { request } = require('http')

const SIGN_ADDRESS = 'http://10.0.0.119:80'

const GET_MIC_RELATED_STREAM_COMMAND = '/usr/bin/log'
const GET_MIC_RELATED_STREAM_ARGS = [
  'stream',
  '--predicate',
  'eventMessage contains "BuiltInHeadphoneInputDevice"',
]

const url = new URL(SIGN_ADDRESS)

const stream = spawn(
  GET_MIC_RELATED_STREAM_COMMAND,
  GET_MIC_RELATED_STREAM_ARGS,
)

stream.stdout.on('data', async (data) => {
  const message = data.toString()

  const isStarting = message.lastIndexOf('starting') != -1
  const isStopping = message.lastIndexOf('stopping') != -1

  if (!isStarting && !isStopping) {
    return
  }

  const payload = isStarting ? 'led_on' : 'led_off'

  try {
    await new Promise((resolve, reject) => {
      const options = {
        hostname: url.host,
        port: url.port,
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          Connection: 'keep-alive',
          'Content-Length': Buffer.byteLength(payload),
        },
      }

      const req = request(options, (res) => {
        res.setEncoding('utf8')

        res.on('data', (data) => {
          console.log('response data', data)
        })

        res.on('end', () => {
          resolve()
        })

        res.on('error', (error) => {
          reject(error)
        })
      })

      req.on('error', (error) => {
        reject(error)
      })

      req.write(payload)
      req.end()
    })
  } catch (error) {
    console.log('error', error)
  }
})

stream.stderr.on('data', (data) => {
  console.log('stderr', data.toString())
})

stream.on('close', () => {
  console.log('closed')
})

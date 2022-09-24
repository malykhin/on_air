const { spawn } = require('child_process')
const { request } = require('http')
const { join } = require('path')

const params = require(join(__dirname, 'watcher_params.json'))

const GET_MIC_RELATED_STREAM_COMMAND = '/usr/bin/log'
const GET_MIC_RELATED_STREAM_ARGS = [
  'stream',
  '--predicate',
  'sender contains "CoreAudio"',
  '--predicate',
  'eventMessage contains "HALS_IOContext_Legacy_Impl::IOThreadEntry"',
]

const url = new URL(params.SIGN_ADDRESS)

const stream = spawn(
  GET_MIC_RELATED_STREAM_COMMAND,
  GET_MIC_RELATED_STREAM_ARGS,
)

console.log('listening to log stream')

stream.stdout.on('data', async (data) => {
  const message = data.toString()

  const hasInputDevice = [
    'BuiltInMicrophoneDevice',
    'BuiltInHeadphoneInputDevice',
    'AppleUSBAudioEngine',
    ':input',
  ].some((it) => message.includes(it))

  if (!hasInputDevice) {
    return
  }

  const isStarting = message.includes('starting')
  const isStopping = message.includes('stopping')

  if (!isStarting && !isStopping) {
    return
  }

  const payload = isStarting ? 'led_on' : 'led_off'

  console.log('sending payload', payload)
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

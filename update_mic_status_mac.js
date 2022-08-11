#!/usr/bin/env node

const { promisify } = require('util')
const { exec, execSync } = require('child_process')
const { request } = require('http')

const execPromise = promisify(exec)

const SIGN_ADDRESS = 'http://10.0.0.119:80'
const POLL_TIMEOUT = 1000

const GET_MIC_STATUS_COMMAND =
  'ioreg -c AppleHDAEngineInput | grep "Digital Mic"'

const url = new URL(SIGN_ADDRESS)

const getValue = (str) =>
  Number(str.split(',').pop().replace('>', '').replace('retain', '').trim())

let prevValue = getValue(execSync(GET_MIC_STATUS_COMMAND).toString())

console.log('initial value', prevValue)

const valuesMap = {
  10: 'led_off',
  12: 'led_on',
}

async function run() {
  try {
    const { stdout } = await execPromise(GET_MIC_STATUS_COMMAND)

    const value = getValue(stdout)

    const data = valuesMap[value]

    if (value === prevValue || !data) {
      return
    }

    console.log('prevValue', prevValue)
    console.log('value', value)
    console.log('request data', data)

    prevValue = value

    await new Promise((resolve, reject) => {
      const options = {
        hostname: url.host,
        port: url.port,
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          Connection: 'keep-alive',
          'Content-Length': Buffer.byteLength(data),
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
      req.write(data)
      req.end()
    })
  } catch (error) {
    console.log('error', error)
  } finally {
    setTimeout(run, POLL_TIMEOUT)
  }
}

run()

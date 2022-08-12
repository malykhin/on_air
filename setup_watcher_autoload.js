#!/usr/bin/env node

const { execSync } = require('child_process')
const { join, resolve } = require('path')
const { writeFileSync } = require('fs')

const whichNode = execSync('which node').toString().trim()
const scriptPath = join(__dirname, 'watch_mic_status_mac.js')

const comUserOnAir = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>com.user.onair</string>
    <key>ProgramArguments</key>  
    <array>
      <string>${whichNode}</string>
      <string>${scriptPath}</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
  </dict>
</plist>
`

const plistFilePath = resolve(
  process.env.HOME,
  'Library/LaunchAgents',
  'com.user.onair.plist',
)

writeFileSync(plistFilePath, comUserOnAir)

console.log(
  execSync(
    'launchctl unload -w ~/Library/LaunchAgents/com.user.onair.plist',
  ).toString(),
)
console.log(
  execSync(
    'launchctl load -w ~/Library/LaunchAgents/com.user.onair.plist',
  ).toString(),
)
console.log(execSync('launchctl start com.user.onair').toString())

#!/usr/bin/env node

const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')
const os = require('os')
const { generateRegistryScript } = require('..')

function getAllFonts () {
  const tmpfile = path.join(__dirname, 'fonts.reg')
  childProcess.execSync(`regedit.exe -e "${tmpfile}" "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts"`)
  const lines = fs.readFileSync(tmpfile).slice(2).toString('utf16le').split(os.EOL)
  fs.unlinkSync(tmpfile)
  const arr = lines.slice(3, lines.length - 2).map(line => {
    const kv = line.split('=').map(v => {
      return JSON.parse(v)
    })
    return {
      key: kv[0],
      value: kv[1]
    }
  })
  return arr
}

function findFontFile (list, name) {
  for (let i = 0; i < list.length; i++) {
    const kv = list[i]
    if (kv.key.indexOf(name) !== -1) {
      return kv.value
    }
  }
  return ''
}

function getCodePage () {
  let codePage
  try {
    codePage = childProcess.execSync('chcp', { stdio: 'pipe' }).toString().match(/[0-9]+/)[0]
    if (!codePage) throw new Error()
  } catch (_) {
    throw new Error('Can not determine code page.')
  }
  return codePage
}

function saveRegistry (buffer) {
  const regFile = path.join(__dirname, 'temp.reg')
  fs.writeFileSync(regFile, buffer, 'utf16le')
  try {
    childProcess.execSync(`regedit.exe -s "${regFile}"`)
  } catch (err) {
    fs.unlinkSync(regFile)
    throw err
  }
  fs.unlinkSync(regFile)
}

async function main (argc, argv) {
  if (process.platform !== 'win32') throw new Error('Windows only.')

  if (argc < 3) {
    console.log('cmdf v' + require('../package.json').version)
    console.log(os.EOL + 'Usage: cmdf <font> [fallback] [scale]')
    console.log(os.EOL + 'Example: cmdf "Consolas" "Microsoft YaHei" 128,96')
    return 0
  }

  const codePage = getCodePage()
  const fontName = argv[2] || 'Consolas'
  const fallbackName = argv[3]

  const keyvalues = getAllFonts()

  if (!findFontFile(keyvalues, fontName)) {
    throw new Error('Can not find font: ' + fontName)
  }

  let buffer
  let fallbackFontFile
  let scale
  if (fallbackName) {
    fallbackFontFile = findFontFile(keyvalues, fallbackName)
    if (!fallbackFontFile) {
      throw new Error('Can not find font: ' + fallbackName)
    }

    scale = argv[4] ? argv[4].split(',').map(s => Number(s)) : [128, 96]
  
    buffer = generateRegistryScript(codePage, fontName, {
      file: fallbackFontFile,
      name: fallbackName,
      scale
    })
  } else {
    buffer = generateRegistryScript(codePage, fontName)
  }
  saveRegistry(buffer)

  console.log('Change default font successfully' + os.EOL)
  console.log(`Code page: ${codePage}`)
  console.log(`Font name: ${fontName}`)
  if (fallbackName) {
    console.log(`Fallback: ${fallbackFontFile}::${fallbackName}, ${scale[0]}, ${scale[1]}`)
  }

  console.log(os.EOL + 'Logout Windows and login again then change code page to 437')
  console.log('in command line prompt / Powershell and configure the font.')
  return 0
}

main(process.argv.length, process.argv).then((code) => {
  process.exitCode = code
}).catch(err => {
  console.error(err)
  process.exitCode = 1
})

let CodePage
(function () {
  CodePage[CodePage['CP_ACP'] = 0] = 'CP_ACP'
  CodePage[CodePage['CP_OEMCP'] = 1] = 'CP_OEMCP'
  CodePage[CodePage['CP_MACCP'] = 2] = 'CP_MACCP'
  CodePage[CodePage['CP_THREAD_ACP'] = 3] = 'CP_THREAD_ACP'
  CodePage[CodePage['CP_SYMBOL'] = 42] = 'CP_SYMBOL'
  CodePage[CodePage['IBM437'] = 437] = 'IBM437'
  CodePage[CodePage['SHIFT_JIS'] = 932] = 'SHIFT_JIS'
  CodePage[CodePage['GB2312'] = 936] = 'GB2312'
  CodePage[CodePage['BIG5'] = 950] = 'BIG5'
  CodePage[CodePage['CP_UTF7'] = 65000] = 'CP_UTF7'
  CodePage[CodePage['CP_UTF8'] = 65001] = 'CP_UTF8'
})(CodePage || (CodePage = {}))

function generateRegistryScript (codePage, fontName, fallback) {
  let template = 'Windows Registry Editor Version 5.00\r\n\r\n'+
    '[HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Console\\TrueTypeFont]\r\n' +
    '"{{codePage}}"="{{fontName}}"\r\n\r\n'
  template = template
    .replace(/\{\{codePage\}\}/g, codePage.toString())
    .replace(/\{\{fontName\}\}/g, fontName)

  let script = template
  if (fallback !== undefined) {
    if (Object.prototype.toString.call(fallback) !== '[object Object]') {
      throw new Error('fallback must be { file: string; name: string; scale: [number, number] }')
    }

    const { file, name, scale } = fallback
    if (typeof file !== 'string') {
      throw new Error('fallback.file must be string.')
    }
    if (typeof name !== 'string') {
      throw new Error('fallback.name must be string.')
    }
    if (!Array.isArray(scale) || scale.length !== 2 || typeof scale[0] !== 'number' || typeof scale[1] !== 'number' || isNaN(scale[0]) || isNaN(scale[1])) {
      throw new Error('fallback.scale must be [number, number].')
    }

    const multiStr = [`${file},${name},${scale[0]},${scale[1]}`, Buffer.from([0, 0]), `${file},${name}`, Buffer.from([0, 0, 0, 0])]
    const fallbackBuffer = Buffer.concat(multiStr.map(s => {
      if (Buffer.isBuffer(s)) return s
      return Buffer.from(s, 'utf16le')
    }))

    const fallbackString = (fontName, fallback) => '[HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\FontLink\\SystemLink]\r\n' +
      '"' + fontName + '"=hex(7):' + fallback + '\r\n\r\n'

    script = script + fallbackString(fontName, Array.prototype.map.call(fallbackBuffer, v => {
      return ('0' + v.toString(16)).slice(-2)
    }).join(','))
  }

  return Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(script, 'utf16le')])
}

exports.CodePage = CodePage
exports.generateRegistryScript = generateRegistryScript

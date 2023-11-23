const archiveExtensions = [
  '7z',
  'apk',
  'bz2',
  'deb',
  'gz',
  'gzip',
  'rar',
  'tar',
  'tar.bz2',
  'tar.gz',
  'tbz2',
  'tgz',
  'zip'
]

const audioExtensions = [
  '3gp',
  '8svx',
  'aa',
  'aac',
  'aax',
  'act',
  'aiff',
  'alac',
  'amr',
  'ape',
  'au',
  'awb',
  'cda',
  'dss',
  'dvf',
  'flac',
  'gsm',
  'iklax',
  'ivs',
  'm4a',
  'm4b',
  'm4p',
  'mmf',
  'mogg',
  'movpkg',
  'mp3',
  'mpc',
  'msv',
  'nmf',
  'oga',
  'ogga',
  'opus',
  'ra',
  'raw',
  'rf64',
  'rm',
  'sln',
  'tta',
  'voc',
  'vox',
  'wav',
  'wma',
  'wv'
]

const codeExtensions = [
  'bash',
  'c++',
  'c',
  'cc',
  'cpp',
  'css',
  'feature',
  'go',
  'h',
  'hh',
  'hpp',
  'htm',
  'html',
  'java',
  'js',
  'json',
  'php',
  'pl',
  'py',
  'scss',
  'sh',
  'sh-lib',
  'sql',
  'ts',
  'xml',
  'yaml',
  'yml'
]

const defaultExtensions = ['accdb', 'rss', 'swf']

const documentExtensions = ['doc', 'docm', 'docx', 'dot', 'dotx', 'lwp', 'odt', 'one', 'vsd', 'wpd']

const formExtensions = ['docf', 'docxf', 'oform']

const imageExtensions = [
  'ai',
  'cdr',
  'eot',
  'eps',
  'gif',
  'jpeg',
  'jpg',
  'otf',
  'pfb',
  'png',
  'ps',
  'psd',
  'svg',
  'ttf',
  'woff',
  'xcf'
]

const presentationExtensions = [
  'odp',
  'pot',
  'potm',
  'potx',
  'ppa',
  'ppam',
  'pps',
  'ppsm',
  'ppsx',
  'ppt',
  'pptm',
  'pptx'
]

const spreadsheetExtensions = [
  'csv',
  'ods',
  'xla',
  'xlam',
  'xls',
  'xlsb',
  'xlsm',
  'xlsx',
  'xlt',
  'xltm',
  'xltx'
]

const textExtensions = [
  'cb7',
  'cba',
  'cbr',
  'cbt',
  'cbtc',
  'cbz',
  'cvbdl',
  'eml',
  'epub',
  'mdb',
  'tex',
  'txt'
]

const videoExtensions = ['mov', 'mp4', 'webm', 'wmv']

const fileIcon = {
  archive: { name: 'resource-type-archive', color: 'var(--oc-color-icon-archive)' },
  audio: { name: 'resource-type-audio', color: 'var(--oc-color-icon-audio)' },
  code: { name: 'resource-type-code', color: 'var(--oc-color-text-default)' },
  default: { name: 'resource-type-file', color: 'var(--oc-color-text-default)' },
  drawio: { name: 'resource-type-drawio', color: 'var(--oc-color-icon-drawio)' },
  document: { name: 'resource-type-document', color: 'var(--oc-color-icon-document)' },
  ifc: { name: 'resource-type-ifc', color: 'var(--oc-color-icon-ifc)' },
  ipynb: { name: 'resource-type-jupyter', color: 'var(--oc-color-icon-jupyter)' },
  image: { name: 'resource-type-image', color: 'var(--oc-color-icon-image)' },
  form: { name: 'resource-type-form', color: 'var(--oc-color-icon-form)' },
  markdown: { name: 'resource-type-markdown', color: 'var(--oc-color-icon-markdown)' },
  odg: { name: 'resource-type-graphic', color: 'var(--oc-color-icon-graphic)' },
  pdf: { name: 'resource-type-pdf', color: 'var(--oc-color-icon-pdf)' },
  presentation: { name: 'resource-type-presentation', color: 'var(--oc-color-icon-presentation)' },
  root: { name: 'resource-type-root', color: 'var(--oc-color-icon-root)' },
  spreadsheet: { name: 'resource-type-spreadsheet', color: 'var(--oc-color-icon-spreadsheet)' },
  text: { name: 'resource-type-text', color: 'var(--oc-color-text-default)' },
  url: { name: 'resource-type-url', color: 'var(--oc-color-text-default)' },
  video: { name: 'resource-type-video', color: 'var(--oc-color-icon-video)' }
}

export function resolveFileIcon(fileExtension: string) {
  if (archiveExtensions.includes(fileExtension)) {
    return fileIcon.archive
  }
  if (audioExtensions.includes(fileExtension)) {
    return fileIcon.audio
  }
  if (codeExtensions.includes(fileExtension)) {
    return fileIcon.code
  }
  if (defaultExtensions.includes(fileExtension)) {
    return fileIcon.default
  }
  if (documentExtensions.includes(fileExtension)) {
    return fileIcon.document
  }
  if (imageExtensions.includes(fileExtension)) {
    return fileIcon.image
  }
  if (formExtensions.includes(fileExtension)) {
    return fileIcon.form
  }
  if (presentationExtensions.includes(fileExtension)) {
    return fileIcon.presentation
  }
  if (spreadsheetExtensions.includes(fileExtension)) {
    return fileIcon.spreadsheet
  }
  if (textExtensions.includes(fileExtension)) {
    return fileIcon.text
  }
  if (videoExtensions.includes(fileExtension)) {
    return fileIcon.video
  }

  if (fileExtension === 'drawio') {
    return fileIcon.drawio
  }
  if (fileExtension === 'ifc') {
    return fileIcon.ifc
  }
  if (fileExtension === 'ipynb') {
    return fileIcon.ipynb
  }
  if (fileExtension === 'md') {
    return fileIcon.markdown
  }
  if (fileExtension === 'odg') {
    return fileIcon.odg
  }
  if (fileExtension === 'pdf') {
    return fileIcon.pdf
  }
  if (fileExtension === 'root') {
    return fileIcon.root
  }
  if (fileExtension === 'url') {
    return fileIcon.url
  }

  return fileIcon.default
}

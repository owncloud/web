const { client } = require('nightwatch-api')
const { propfind, getTrashBinElements } = require('./webdavHelper')
const convert = require('xml-js')
const { relativeTo, normalize, join } = require('./path')

exports.getAllFilesFolders = function (user) {
  const backendURL = client.globals.backend_url
  const baseURL = new URL(join(backendURL, `remote.php/dav/files/${user}/`))
  const basePath = baseURL.pathname
  return propfind(`/files/${user}`, user, [])
    .then(str => {
      const data = convert.xml2js(str, { compact: true })['d:multistatus']['d:response']
      const filepaths = data.map(elements =>
        normalize(
          elements['d:href']._text)
      )
      const filenames = filepaths.map(element => relativeTo(basePath, element))
      // The first element in the filenames is the username which is not actually a filename.
      // The first element should therefore be removed from filenames
      return filenames.splice(1)
    })
}

exports.getAllFolders = async function (user) {
  const filenames = await exports.getAllFilesFolders(user)
  const folders = filenames.filter(elements => elements.endsWith('/'))
  return folders.map(folder => folder.slice(0, -1))
}

exports.getAllFiles = async function (user) {
  const filenames = await exports.getAllFilesFolders(user)
  return filenames.filter(elements => !elements.endsWith('/'))
}

exports.getElementsMatchingPattern = async function (pattern, files) {
  return files.filter(elements => elements.toLowerCase().includes(pattern))
}

exports.getAllFilesStartingWithDot = function (elements) {
  return elements.filter(elem => !elem.startsWith('.'))
}

exports.getTrashbinFolders = async function (user) {
  const trashbinElements = await getTrashBinElements(user, 1)
  const trashbinResources = trashbinElements.splice(1)
  return trashbinResources.filter(elements => elements.href.endsWith('/'))
    .map(elements => elements.originalFilename)
}

exports.getTrashbinFiles = async function (user) {
  const trashbinElements = await getTrashBinElements(user, 1)
  const trashbinResources = trashbinElements.splice(1)
  return trashbinResources.filter(elements => !elements.href.endsWith('/'))
    .map(elements => elements.originalFilename)
}

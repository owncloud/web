let lastUploadedFolder = ''
const createdFolders = []

exports.getLastUploadedFolder = client => {
  if (client.globals.remote_selenium) {
    return client.sessionId
  } else {
    return lastUploadedFolder
  }
}

exports.setLastUploadedFolder = folder => {
  lastUploadedFolder = folder
}

exports.addCreatedFolder = folderName => {
  createdFolders.push(folderName)
}

exports.getCreatedFolders = () => {
  return createdFolders
}

exports.newFileName = length => {
  var result = ''
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  var charactersLength = characters.length
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

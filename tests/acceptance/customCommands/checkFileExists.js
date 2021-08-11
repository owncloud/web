const fs = require('fs-extra')

function checkFileExists() {}

checkFileExists.prototype.command = function (path) {
  if (fs.existsSync(path)) {
    console.log('The file Exists')
  } else {
    throw new Error("The File Doesn't exist")
  }
}

module.exports = checkFileExists

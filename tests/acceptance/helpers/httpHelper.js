const { client } = require('nightwatch-api')
let password = ''

exports.createAuthHeader = function (userId) {
  if (userId === client.globals.backend_admin_username) {
    password = client.globals.backend_admin_password
  } else {
    password = userId
  }
  return {
    'Authorization': 'Basic ' +
      Buffer.from(userId + ':' + password).toString('base64')
  }
}

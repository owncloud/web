var fs = require('fs')
var resolve = require('path').resolve
var join = require('path').join
var cp = require('child_process')
var os = require('os')

if(fs.existsSync('config.json')) {
  var config = require('./config.json')
}else{
  var config = require('./tests/drone/config.json')
}

var yarnCmd = os.platform().startsWith('win') ? 'yarn.cmd' : 'yarn'

// get library path
var lib = resolve(__dirname, 'apps')

config.apps
  .forEach(function (mod) {
    var modPath = join(lib, mod)
// ensure path has package.json
if (!fs.existsSync(join(modPath, 'package.json'))) return

// install folder
console.info('INSTALLING: '+ mod)
yarnScript( 'install', modPath )
yarnScript( 'build', modPath)
})

function yarnScript (command , modPath) {
  let response
  try {
    cp.spawnSync(yarnCmd, [command], { env: process.env, cwd: modPath, stdio: 'inherit' })
  } catch (err) {
    console.log(err)
    return err
  }
  return
}

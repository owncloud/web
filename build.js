var fs = require('fs')
var resolve = require('path').resolve
var join = require('path').join
var cp = require('child_process')
var os = require('os')

// get library path
var lib = resolve(__dirname, 'apps')

fs.readdirSync(lib)
  .forEach(function (mod) {
    var modPath = join(lib, mod)
// ensure path has package.json
if (!fs.existsSync(join(modPath, 'package.json'))) return

// yarn binary based on OS
var yarnCmd = os.platform().startsWith('win') ? 'yarn.cmd' : 'yarn'

// install folder
cp.spawn(yarnCmd, ['install'], { env: process.env, cwd: modPath, stdio: 'inherit' })
// build folder
cp.spawn(yarnCmd, ['run','build'], { env: process.env, cwd: modPath, stdio: 'inherit' })

})

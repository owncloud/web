var fs = require('fs')
var chalk = require('chalk')
var resolve = require('path').resolve
var join = require('path').join
var cp = require('child_process')
var os = require('os')


var npxCmd = os.platform().startsWith('win') ? 'npx.cmd' : 'npx'

// get library path
var lib = resolve(__dirname, 'apps')

console.log(chalk.blue('Upgrading:'), chalk.red('Core'));
npmScript(['npm-check-updates', '-a'], resolve(__dirname))

fs.readdirSync(lib)
  .forEach(function (mod) {
    var modPath = join(lib, mod)
// ensure path has package.json
if (!fs.existsSync(join(modPath, 'package.json'))) return

// install folder
console.info(chalk.blue('Upgrading: '), chalk.red(mod))
npmScript(['npm-check-updates', '-a'] , modPath )
})

function npmScript (command , modPath) {
  try {
    cp.spawnSync(npxCmd, command, { env: process.env, cwd: modPath, stdio: 'inherit' })
  } catch (err) {
    console.log(err)
    return err
  }
  return
}

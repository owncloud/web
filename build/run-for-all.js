var fs = require('fs')
var chalk = require('chalk')
var resolve = require('path').resolve
var join = require('path').join
var cp = require('child_process')
var runCommandsInParallel = false
var command = process.argv[2]
var commandArgs = process.argv.slice(3)

// command to be executed
if (process.argv[2] === '-p') {
  runCommandsInParallel = true
  command = process.argv[3]
  commandArgs = process.argv.slice(4)
}

var fullCommand = command + ' ' + commandArgs.join(' ')

// get library path
var lib = resolve(__dirname, '..', 'apps')

// run command in all apps
fs.readdirSync(lib).forEach(function(mod) {
  var modPath = join(lib, mod)
  // ensure path has package.json
  if (!fs.existsSync(join(modPath, 'package.json'))) return

  // Run command
  console.info(chalk.blue(fullCommand), chalk.red(mod))
  runCommand(command, commandArgs, modPath)
})

// run command in core
console.info(chalk.blue(fullCommand), chalk.red('Core'))
runCommand(command, commandArgs, resolve(__dirname, '..'))

function runCommand(command, args, modPath) {
  try {
    if (runCommandsInParallel) {
      cp.spawn(command, args, { env: process.env, cwd: modPath, stdio: 'inherit' })
    } else {
      cp.spawnSync(command, args, { env: process.env, cwd: modPath, stdio: 'inherit' })
    }
  } catch (err) {
    console.log(err)
    return err
  }
}

const sass = require('node-sass')
const fs = require('fs')
const chokidar = require('chokidar')

const compile = (theme) => {
  sass.render({
    file: `${__dirname}/themes/${theme}.scss`
  }, function (err, result) {
    if (err) throw err
    fs.writeFile(`${__dirname}/dist/themes/${theme}.css`, result.css, (err) => {
      if (err) throw err
      console.log(`${__dirname}/dist/themes/${theme}.css has been written\n`)
    })
  })
}

let mode = process.argv[2]
let theme = process.argv[3]

if (typeof theme === 'string' && mode === 'prod') {
  compile(theme)
} else if (typeof theme === 'string' && mode === 'dev') {
  compile(theme)
  console.log('+ + + + + + + + + + + + + + + + + + + + +\n+ Theme compiler will watch for changes +\n+ + + + + + + + + + + + + + + + + + + + +\n')

  const watcher = chokidar.watch('file, dir, glob, or array', {
    ignored: /(^|[\/\\])\../,
    persistent: true
  })

  watcher.add([
    `${__dirname}/themes/${theme}.scss`,
    `${__dirname}/themes/${theme}/**/*.scss`
  ])

  watcher.on('change', (path) => {
    console.log(`${path} changed`)
    compile(theme)
  })
} else {
  console.warn('+ + + + + + + + + + + + + + + + + + + + + +\n+ Please add theme name as the parameter! +\n+ + + + + + + + + + + + + + + + + + + + + +')
}

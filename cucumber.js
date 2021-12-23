const path = require('path')
const { config } = require('./tests/e2e/config')
const fs = require('fs')

if (!fs.existsSync(config.reportDir)) {
  fs.mkdirSync(path.join(config.reportDir, 'cucumber'), { recursive: true })
}

module.exports = {
  e2e: `
  --require ./tests/e2e/**/*.ts
  --retry ${config.retry}
  --require-module ts-node/register
  --format @cucumber/pretty-formatter
  --format json:${path.join(config.reportDir, 'cucumber', 'report.json')}
  --format message:${path.join(config.reportDir, 'cucumber', 'report.ndjson')}
  --format html:${path.join(config.reportDir, 'cucumber', 'report.html')}
  --publish-quiet
  --format-options ${JSON.stringify({
    snippetInterface: 'async-await',
    snippetSyntax: './tests/e2e/cucumber/environment/snippets-syntax.js'
  })}
  `
}

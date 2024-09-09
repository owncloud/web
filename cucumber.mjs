import path from 'path'
import fs from 'fs'
import { config } from './tests/e2e/config.js'

if (!fs.existsSync(config.reportDir)) {
  fs.mkdirSync(path.join(config.reportDir, 'cucumber'), { recursive: true })
}

const e2e = `
  --loader ts-node/esm
  --import ./tests/e2e/**/*.ts
  --retry ${config.retry}
  --format @cucumber/pretty-formatter
  --format json:${path.join(config.reportDir, 'cucumber', 'report.json')}
  --format message:${path.join(config.reportDir, 'cucumber', 'report.ndjson')}
  --format html:${path.join(config.reportDir, 'cucumber', 'report.html')}
  --format-options ${JSON.stringify({
    snippetInterface: 'async-await',
    snippetSyntax: './tests/e2e/cucumber/environment/snippets-syntax.mjs'
  })}
  `

export { e2e }
export default {}

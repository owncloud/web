module.exports = {
  smoke: `
  --require ./tests/smoke/**/*.ts
  --require-module ts-node/register
  --format @cucumber/pretty-formatter
  --publish-quiet
  --format-options ${JSON.stringify({
    snippetInterface: 'async-await',
    snippetSyntax: './tests/smoke/support/cucumber/snippets-syntax.js'
  })}
  `
}

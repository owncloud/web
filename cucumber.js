module.exports = {
  smoke: `
  --require ./tests/e2e/**/*.ts
  --retry 1
  --require-module ts-node/register
  --format @cucumber/pretty-formatter
  --publish-quiet
  --format-options ${JSON.stringify({
    snippetInterface: 'async-await',
    snippetSyntax: './tests/e2e/cucumber/environment/snippets-syntax.js'
  })}
  `
}

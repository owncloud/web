// borrowed from https://github.com/orieken/playwright-cucumber-starter
// thanks @orieken if you will ever read this

function TypeScriptSnippetSyntax(snippetInterface) {
  this.snippetInterface = snippetInterface
}

function addParameters(allParameterNames) {
  let prefix = ''
  if (allParameterNames.length > 0) {
    prefix = ', '
  }
  return prefix + allParameterNames.join(', ')
}

TypeScriptSnippetSyntax.prototype.build = function ({
  generatedExpressions,
  functionName,
  stepParameterNames
}) {
  let functionKeyword = ''
  const functionInterfaceKeywords = {
    generator: `${functionKeyword}*`,
    'async-await': `async ${functionKeyword}`,
    promise: 'async '
  }

  if (this.snippetInterface) {
    functionKeyword = `${functionKeyword}${functionInterfaceKeywords[this.snippetInterface]}`
  }

  const implementation = [
    'const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this\n',
    'await new Promise(resolve => setTimeout(resolve, 10))'
  ]
    .map((str) => `  ${str}`)
    .join('\n')

  const definitionChoices = generatedExpressions.map((generatedExpression, index) => {
    const prefix = index === 0 ? '' : '// '

    const allParameterNames = generatedExpression.parameterNames
      .map((parameterName) => `${parameterName}: any`)
      .concat(stepParameterNames.map((stepParameterName) => `${stepParameterName}: any`))

    return (
      `${prefix}${functionName}('` +
      generatedExpression.source.replace(/'/g, "\\'") +
      "', " +
      functionKeyword +
      'function (this: World' +
      addParameters(allParameterNames) +
      '): Promise<void> {\n'
    )
  })

  return definitionChoices.join('') + `${implementation}\n});`
}

export default TypeScriptSnippetSyntax

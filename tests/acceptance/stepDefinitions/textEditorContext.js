const { client } = require('nightwatch-api')
const assert = require('assert')
const _ = require('lodash')
const { Given, When, Then } = require('@cucumber/cucumber')

const textEditor = client.page.textEditorPage()
const filesList = client.page.FilesPageElement.filesList()

Given('the user has opened file {string} in the text editor webUI', async (fileName) => {
  await filesList.clickOnFileName(fileName)
  await textEditor.waitForPageLoaded()
  const actualFileName = await textEditor.getFileName()
  return assertEqualText(fileName, actualFileName)
})

When('the user opens file {string} in the text editor webUI', (fileName) => {
  return filesList.clickOnFileName(fileName)
})

When('the user inputs the content {string} in the text editor webUI', async (content) => {
  return await textEditor.updateFileContent(content)
})

When('the user appends the content {string} in the text editor webUI', async (content) => {
  return await textEditor.appendContentToFile(content)
})

When('the user saves the file in the text editor webUI', async () => {
  return await textEditor.saveFileEdit()
})

When('the user closes the text editor using the webUI', async () => {
  return await textEditor.closeTextEditor()
})

Then('the file {string} should be displayed in the text editor webUI', async (fileName) => {
  const actualFileName = await textEditor.getFileName()
  return assertEqualText(fileName, actualFileName)
})

Then('the file should have content {string} in the text editor webUI', async (content) => {
  const contentInEditor = await textEditor.getContentFromEditor()
  return assertEqualText(content, contentInEditor, 'content')
})

Then('the file should not have content {string} in the text editor webUI', async (content) => {
  const contentInEditor = await textEditor.getContentFromEditor()
  return assertNotEqualText(content, contentInEditor, 'content')
})

Then('the preview panel should have the content {string} on the webUI', async (content) => {
  const contentInPreview = await textEditor.getContentFromPanel()
  return assertEqualText(content, contentInPreview, 'content')
})

When(
  'the user opens file {string} in the text editor using the action menu option on the webUI',
  async (fileName) => {
    return await textEditor.openMdEditorUsingActionMenu(fileName)
  }
)

Then(
  'the preview panel should have {string} element with text {string}',
  async (tagName, innerText) => {
    return await assertHasElementWithText(tagName, innerText)
  }
)

const assertEqualText = (expected, actual, type = 'file') => {
  let error = ''
  if (type === 'file') {
    error =
      'File "' + expected + '" expected to be opened in the text editor but found "' + actual + '"'
  } else if (type === 'content') {
    error = 'File expected to have content "' + expected + '" but found "' + actual + '"'
  }
  return assert.strictEqual(actual, expected, error)
}

const assertNotEqualText = (expected, actual, type = 'file') => {
  let error = ''
  if (type === 'file') {
    error = 'File "' + expected + '" expected not to be opened in the text editor but found'
  } else if (type === 'content') {
    error = 'File expected not to have content "' + expected + '" but found.'
  }
  return assert.notStrictEqual(actual, expected, error)
}

const assertHasElementWithText = async (tagName, innerText) => {
  const previewPanel = textEditor.getPreviewPanelElement()
  const previewPanelButtonElement = textEditor.getPreviewPanelButtonElement()
  const searchElement = previewPanel + ' > ' + tagName
  let hasElement = false

  await client.waitForElementPresent(previewPanelButtonElement).click(previewPanelButtonElement)
  await client.waitForElementPresent(searchElement).getText(searchElement, (result) => {
    hasElement = _.isEqual(result.value, innerText)
  })

  return assert.strictEqual(
    hasElement,
    true,
    'Preview Panel expected to have element "' +
      tagName +
      '" with text "' +
      innerText +
      '" but not found'
  )
}

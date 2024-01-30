const { client } = require('nightwatch-api')

const filesList = client.page.FilesPageElement.filesList()
const filesActionsMenu = client.page.FilesPageElement.fileActionsMenu()

const saveButtonSelector = '#app-save-action'

module.exports = {
  commands: {
    /**
     * gets inner text from given html element
     * @param {string} element - css selectoreditorTextarea
     *
     * @returns {Promise<string>}
     */
    getInnerText: async function (element) {
      let text = ''
      await this.waitForElementVisible(element).getText(element, (result) => (text = result.value))
      return text
    },
    /**
     * gets value from given html input element
     * @param {string} element - css selector
     *
     * @returns {Promise<string>}
     */
    getInputValue: async function (element) {
      let content = ''
      await this.waitForElementVisible(element).getValue(element, (result) => {
        content = result.value
      })
      return content
    },
    getFileName: async function () {
      let fileName = ''
      await this.waitForElementVisible('@fileName').getAttribute(
        '@fileName',
        'data-test-resource-name',
        (result) => {
          fileName = result.value
        }
      )
      return fileName
    },
    getContentFromEditor: async function () {
      const selector = await this.getEditorInputSelector()

      return this.getInputValue(selector)
    },
    getContentFromPanel: function () {
      return this.waitForElementVisible('@editorPreviewButton')
        .click('@editorPreviewButton')
        .waitForElementVisible('@editorPreviewPanel')
        .getInnerText('@editorPreviewPanel')
    },
    getPreviewPanelElement: function () {
      return this.elements.editorPreviewPanel.selector
    },
    getPreviewPanelButtonElement: function () {
      return this.elements.editorPreviewButton.selector
    },
    saveFileEdit: function () {
      return this.waitForElementVisible('@saveButton')
        .click('@saveButton')
        .waitForElementVisible('@saveButtonDisabled')
    },
    closeTextEditor: function () {
      return this.waitForElementVisible('@closeButton').click('@closeButton')
    },
    /**
     * clears and updates textarea with new value
     * @param {string} content
     */
    updateFileContent: async function (content) {
      const selector = await this.getEditorInputSelector()

      await this.waitForElementVisible(selector)
        .click(selector)
        .clearValue(selector)
        .setValue(selector, content)
    },
    waitForPageLoaded: function () {
      return this.waitForElementVisible('@editor')
    },
    /**
     * appends new content to the existing content
     * @param {string} content
     */
    appendContentToFile: async function (content) {
      const selector = await this.getEditorInputSelector()

      await this.waitForElementVisible(selector)
        .sendKeys(selector, client.Keys.END)
        .setValue(selector, content)
    },
    /**
     * @param {string} fileName
     */
    openMdEditorUsingActionMenu: async function (fileName) {
      await filesList.openFileActionsMenu(fileName)
      await filesActionsMenu.textEditor()
      return this
    },
    getEditorInputSelector: async function () {
      let selector = null
      await this.waitForElementVisible('@editor').getAttribute(
        '@editor',
        'data-markdown-mode',
        (result) => {
          selector =
            result.value === 'true' ? '@editorMarkdownInputArea' : '@editorPlainTextInputArea'
        }
      )
      return selector
    }
  },
  elements: {
    editor: {
      selector: '#text-editor #text-editor-container'
    },
    editorPlainTextInputArea: {
      selector: '#text-editor #text-editor-container .ww-mode .ProseMirror'
    },
    editorMarkdownInputArea: {
      selector: '#text-editor #text-editor-container .md-mode .ProseMirror'
    },
    editorPreviewButton: {
      selector: '#text-editor #text-editor-container .tab-item:nth-child(2)'
    },
    editorPreviewPanel: {
      selector:
        '#text-editor #text-editor-container .toastui-editor-md-preview .toastui-editor-contents'
    },
    saveButton: {
      selector: saveButtonSelector
    },
    closeButton: {
      selector: '#app-top-bar-close'
    },
    fileName: {
      selector: '.oc-resource-name'
    },
    saveButtonDisabled: {
      selector: `${saveButtonSelector}:disabled`
    }
  }
}

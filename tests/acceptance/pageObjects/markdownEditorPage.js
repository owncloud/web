const { client } = require('nightwatch-api')

const filesList = client.page.FilesPageElement.filesList()
const filesRow = client.page.FilesPageElement.filesRow()

module.exports = {
  commands: {
    /**
     * gets inner text from given html element
     * @param {string} element - css selector
     *
     * @returns {Promise<string>}
     */
    getInnerText: async function(element) {
      let text = ''
      await this.waitForElementVisible(element).getText(element, result => (text = result.value))
      return text
    },
    /**
     * gets value from given html input element
     * @param {string} element - css selector
     *
     * @returns {Promise<string>}
     */
    getInputValue: async function(element) {
      let content = ''
      await this.waitForElementVisible(element).getValue(element, result => {
        content = result.value
      })
      return content
    },
    getFileName: function() {
      return this.getInnerText('@fileName')
    },
    getContentFromEditor: function() {
      return this.getInputValue('@editorTextarea')
    },
    getContentFromPanel: function() {
      return this.getInnerText('@previewPanel')
    },
    getPreviewPanelElement: function() {
      return this.elements.previewPanel.selector
    },
    saveFileEdit: function() {
      return this.waitForElementVisible('@saveButton').click('@saveButton')
    },
    closeMarkdownEditor: function() {
      return this.waitForElementVisible('@closeButton').click('@closeButton')
    },
    /**
     * clears and updates textarea with new value
     * @param {string} content
     */
    updateFileContent: async function(content) {
      await this.waitForElementVisible('@editorTextarea')
        .click('@editorTextarea')
        .clearValueWithEvent('@editorTextarea')
        .setValue('@editorTextarea', content)
    },
    /**
     * appends new content to the existing content
     * @param {string} content
     */
    appendContentToFile: async function(content) {
      await this.waitForElementVisible('@editorTextarea').setValue('@editorTextarea', content)
    },
    /**
     * @param {string} fileName
     */
    openMdEditorUsingActionMenu: async function(fileName) {
      await filesList.waitForFileVisible(fileName)
      await filesRow.openFileActionsMenu(fileName).markdownEditor()
      return this
    }
  },
  elements: {
    editorTextarea: {
      selector: '.uk-container textarea'
    },
    saveButton: {
      selector: '#markdown-editor-app-bar .uk-first-column .oc-button'
    },
    closeButton: {
      selector: '#markdown-editor-app-bar .uk-text-right .oc-button'
    },
    fileName: {
      selector: '#markdown-editor-app-bar .uk-text-center span'
    },
    previewPanel: {
      selector: '.uk-container > div'
    }
  }
}

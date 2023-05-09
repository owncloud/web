/* eslint-disable no-unused-expressions */
const _ = require('lodash')
const timeoutHelper = require('../../helpers/timeoutHelper')
const xpathHelper = require('../../helpers/xpath')
const util = require('util')

module.exports = {
  commands: {
    isThumbnailVisible: function (previewSize, item) {
      if (previewSize === 'big') {
        return this.waitForElementVisible('@sidebar').waitForElementVisible(
          '@fileInfoIconBigPreview'
        )
      } else {
        const panelName = item === 'people' || item === 'links' ? 'sharing' : item
        return this.waitForElementVisible('@sidebar').waitForElementVisible(
          util.format(this.elements.fileInfoIconSmallPreview.selector, panelName)
        )
      }
    },
    closeSidebarIfOpen: async function (timeout = 300) {
      if (!(await this.isSideBarOpen(false))) {
        return this.api.page.FilesPageElement.filesList()
      }

      try {
        await this.click({
          selector: '@sidebarCloseBtn',
          timeout: timeoutHelper.parseTimeout(timeout)
        })
      } catch (e) {
        // do nothing
      }
      return this.api.page.FilesPageElement.filesList()
    },
    isSideBarOpen: async function (expectedToOpen = true) {
      const element = this.elements.sidebar
      let isVisible = false
      const timeout = expectedToOpen
        ? this.api.globals.waitForConditionTimeout
        : this.api.globals.waitForNegativeConditionTimeout
      await this.isVisible(
        {
          locateStrategy: element.locateStrategy,
          selector: element.selector,
          timeout: timeoutHelper.parseTimeout(timeout),
          suppressNotFoundErrors: !expectedToOpen
        },
        (result) => {
          isVisible = result.value === true
        }
      )
      return isVisible
    },
    isSideBarOpenForResource: async function (
      resource,
      elementType = 'any',
      expectedToOpen = true
    ) {
      if (!(await this.isSideBarOpen(expectedToOpen))) {
        return false
      }
      const timeout = expectedToOpen
        ? this.api.globals.waitForConditionTimeout
        : this.api.globals.waitForNegativeConditionTimeout

      const selector = this.getResourceInfoSelector(resource, elementType)
      let resourceInfoVisible = false
      await this.isAnyElementVisible(
        {
          locateStrategy: 'xpath',
          selector,
          timeout: timeoutHelper.parseTimeout(timeout),
          suppressNotFoundErrors: !expectedToOpen
        },
        (result) => (resourceInfoVisible = result.isVisible)
      )
      return resourceInfoVisible
    },
    getResourceInfoSelector: function (resource, elementType = 'any') {
      const name = xpathHelper.buildXpathLiteral(resource)
      const path = xpathHelper.buildXpathLiteral('/' + resource)
      if (elementType === 'any') {
        return util.format(this.elements.fileInfoResourceNameAnyType.selector, name, path)
      }
      const type = xpathHelper.buildXpathLiteral(elementType)
      return util.format(this.elements.fileInfoResourceName.selector, name, path, type)
    },
    activatePanel: async function (item) {
      const panelName = item === 'people' || item === 'links' ? 'collaborators' : item
      const active = await this.isPanelActive(item, false)
      if (!active) {
        let backBtnVisible = false
        await this.isVisible(
          {
            selector: '@sidebarBackBtn',
            timeout: this.api.globals.waitForNegativeConditionTimeout,
            suppressNotFoundErrors: true
          },
          (result) => {
            backBtnVisible = result.value === true
          }
        )
        if (backBtnVisible) {
          await this.click({
            selector: '@sidebarBackBtn'
          })
          await this.waitForAnimationToFinish() // wait for sliding animation to the root panel
        }
        const menuItemElement = this.elements[panelName + 'PanelMenuItem']
        await this.click({
          locateStrategy: menuItemElement.locateStrategy,
          selector: menuItemElement.selector
        })
          .waitForAjaxCallsToStartAndFinish()
          .waitForAnimationToFinish() // wait for sliding animation to the sub panel
      }
      const panelElement = this.elements[panelName + 'Panel']
      return await this.waitForElementPresent(panelElement.locateStrategy, panelElement.selector)
    },
    getActionsMenuItemsExceptDefaults: async function () {
      const defaultItems = ['add to favorites', 'copy', 'cut', 'rename', 'delete']
      const items = []
      let elements
      await this.api.elements('@panelActionsItems', function (result) {
        elements = result.value
      })
      for (const { ELEMENT } of elements) {
        await this.api.elementIdText(ELEMENT, function (result) {
          let notDefault = true
          for (const item of defaultItems) {
            if (_.isEqual(item, result.value.toLowerCase())) {
              notDefault = false
              break
            }
          }
          notDefault ? items.push(result.value.toLowerCase()) : null
        })
      }
      return items
    },
    isPanelActive: async function (panelName, expectToBeActive = true) {
      panelName = panelName === 'people' ? 'collaborators' : panelName
      const element = this.elements[panelName + 'Panel']
      let isVisible = false

      const timeout = expectToBeActive
        ? this.api.globals.waitForConditionTimeout
        : this.api.globals.waitForNegativeConditionTimeout

      await this.isVisible(
        {
          locateStrategy: element.locateStrategy,
          selector: element.selector,
          timeout: timeoutHelper.parseTimeout(timeout),
          suppressNotFoundErrors: !expectToBeActive
        },
        (result) => {
          isVisible = result.value === true
        }
      )
      return isVisible
    },
    /**
     * checks if it's possible to navigate into the given panel
     *
     * @param {string} panelName
     * @param {number} timeout
     * @returns {Promise<boolean>}
     */
    isPanelSelectable: async function (panelName, expectToBeSelectable = true) {
      panelName = panelName === 'people' ? 'collaborators' : panelName
      const element = this.elements[panelName + 'PanelMenuItem']
      let isVisible = false

      const timeout = expectToBeSelectable
        ? this.api.globals.waitForConditionTimeout
        : this.api.globals.waitForNegativeConditionTimeout

      await this.isVisible(
        {
          locateStrategy: element.locateStrategy,
          selector: element.selector,
          timeout: timeoutHelper.parseTimeout(timeout),
          suppressNotFoundErrors: !expectToBeSelectable
        },
        (result) => {
          isVisible = result.value === true
        }
      )
      return isVisible
    },
    isSharingPanelSelectable: async function (expectToBeSelectable = true) {
      return await this.isPanelSelectable('people', expectToBeSelectable)
    },
    copyPrivateLink: function () {
      return this.waitForElementVisible('@privateLinkURLCopyButton').click(
        '@privateLinkURLCopyButton'
      )
    }
  },
  elements: {
    sidebar: {
      selector: '//*[@id="app-sidebar"]',
      locateStrategy: 'xpath'
    },
    fileInfoIconBigPreview: {
      selector: '#oc-file-details-sidebar .details-icon'
    },
    fileInfoIconSmallPreview: {
      selector: '#sidebar-panel-%s .file_info__icon'
    },
    fileInfoResourceNameAnyType: {
      selector: `//div[contains(@id, "app-sidebar")]//span[contains(@class, "oc-resource-name") and (@data-test-resource-name=%s or @data-test-resource-path=%s)]`,
      locateStrategy: 'xpath'
    },
    fileInfoResourceName: {
      selector: `//div[contains(@id, "app-sidebar")]//span[contains(@class, "oc-resource-name") and (@data-test-resource-name=%s or @data-test-resource-path=%s) and @data-test-resource-type=%s]`,
      locateStrategy: 'xpath'
    },
    sidebarCloseBtn: {
      selector:
        '//div[contains(@id, "app-sidebar")]//*[contains(@class, "is-active-")]//button[contains(@class, "header__close")]',
      locateStrategy: 'xpath'
    },
    sidebarBackBtn: {
      selector:
        '//div[contains(@id, "app-sidebar")]//*[contains(@class, "is-active-sub-panel")]//button[contains(@class, "header__back")]',
      locateStrategy: 'xpath'
    },
    panelActionsItems: {
      selector:
        '//ul[@id="oc-files-actions-sidebar"]//span[@class="oc-files-context-action-label"]',
      locateStrategy: 'xpath'
    },
    panelSelectButtons: {
      selector:
        '//div[contains(@id, "app-sidebar")]//div[contains(@class, "sidebar-panel__navigation")]/button',
      locateStrategy: 'xpath'
    },
    collaboratorsPanel: {
      selector:
        '//*[@id="sidebar-panel-sharing"]//*[contains(@class, "sidebar-panel__body-content")]',
      locateStrategy: 'xpath'
    },
    collaboratorsPanelMenuItem: {
      selector: '//button[@id="sidebar-panel-sharing-select"]',
      locateStrategy: 'xpath'
    },
    linksPanel: {
      selector: '#oc-files-file-link'
    },
    linksPanelMenuItem: {
      selector: '//button[@id="sidebar-panel-links-select"]',
      locateStrategy: 'xpath'
    },
    actionsPanel: {
      selector:
        '//*[@id="sidebar-panel-actions"]//*[contains(@class, "sidebar-panel__body-content")]',
      locateStrategy: 'xpath'
    },
    actionsPanelMenuItem: {
      selector: '//button[@id="sidebar-panel-actions-select"]',
      locateStrategy: 'xpath'
    },
    detailsPanel: {
      selector:
        '//*[@id="sidebar-panel-details"]//*[contains(@class, "sidebar-panel__body-content")]',
      locateStrategy: 'xpath'
    },
    detailsPanelMenuItem: {
      selector: '//button[@id="sidebar-panel-details-select"]',
      locateStrategy: 'xpath'
    },
    privateLinkURLCopyButton: {
      selector: '.oc-files-private-link-copy-url'
    },
    versionsPanel: {
      selector:
        '//*[@id="sidebar-panel-versions"]//*[contains(@class, "sidebar-panel__body-content")]',
      locateStrategy: 'xpath'
    },
    versionsPanelMenuItem: {
      selector: '//button[@id="sidebar-panel-versions-select"]',
      locateStrategy: 'xpath'
    }
  }
}

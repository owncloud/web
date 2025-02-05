import { Given, When, Then } from '@cucumber/cucumber'
import { World } from '../../environment'
import { objects } from '../../../support'

import { expect } from '@playwright/test'

const selectors = {
  loginBackground: '.oc-login-bg',
  loginForm: '.oc-login-form',
  loginUsername: '#oc-login-username',
  loginPassword: '#oc-login-password',
  webNavSidebar: '#web-nav-sidebar',
  toggleSidebarBtn: '.toggle-sidebar-button',
  appNavigationCollapsed: '.oc-app-navigation-collapsed',
  files: '#files',
  resourceTableEditName: '.resource-table-edit-name',
  resourceIconLink: '.oc-resource-icon-link',
  resourceTableCondensed: '.resource-table-condensed',
  filesSpaceTableCondensed: '#files-space-table.condensed', // '.condensed.files-table',
  resourceTiles: '.resource-tiles',
  tilesControls: '.oc-tiles-controls',
  tilesView: '#tiles-view',
  cardMediaTop: '.oc-card-media-top',
  resourceTable: '.resource-table',
  filesSpaceTable: '#files-space-table',
  filesViewOptionsBtn: '#files-view-options-btn',
  displayOptionsMenu: '#files-app-bar-controls-right .tippy-content',
  webContentMain: '#web-content-main',
  contextMenuDropWhitespace: '#context-menu-drop-whitespace',
  newFileMenuBtn: '#new-file-menu-btn',
  newResourceContextMenu: '.files-app-bar-actions .tippy-content',
  newFolderBtn: '#new-folder-btn',
  ocModal: '.oc-modal',
  ocModalCancel: '.oc-modal-body-actions-cancel',
  uploadMenuBtn: '#upload-menu-btn',
  uploadContextMenu: '.files-app-bar-actions .tippy-content',
  appbarBatchActions: '#oc-appbar-batch-actions',
  filesSpaceTableCheckbox: '#files-space-table .oc-checkbox'
}

// Scenario: check accessibility of files view
Then(
  '{string} should not encounter any automatically detectable accessibility issues concerning the files section in default table view',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getAccessibilityConformityViolationsWith2Exceptions(
      selectors.files,
      selectors.resourceTableEditName,
      selectors.resourceIconLink
    )

    // excluded for known accessibility issues
    // selectors.resourceTableEditName --> buttons must have discernible text
    // selectors.resourceIconLink --> buttons/links must have discernible text

    expect(a11yViolations).toMatchObject([])
  }
)

When(
  '{string} switches to the condensed table view',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    await a11yObject.switchToCondensedTableView()
  }
)

Then(
  '{string} should not encounter any automatically detectable accessibility issues concerning the files section in condensed table view',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getAccessibilityConformityViolationsWith2Exceptions(
      selectors.filesSpaceTable,
      selectors.resourceTableEditName,
      selectors.resourceIconLink
    )

    // excluded for known accessibility issues
    // selectors.resourceTableEditName --> buttons must have discernible text
    // selectors.resourceIconLink --> buttons/links must have discernible text

    expect(a11yViolations).toMatchObject([])
  }
)

Then(
  '{string} should not encounter any automatically detectable accessibility issues concerning the files section in tiles view',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getAccessibilityConformityViolationsWithException(
      selectors.tilesView,
      selectors.cardMediaTop
    )

    // excluded for known accessibility issues
    // selectors.cardMediaTop --> issue with tiles with picture preview, element has focusable descendants

    expect(a11yViolations).toMatchObject([])
  }
)

Given(
  '{string} switches to the default table view',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    await a11yObject.switchToDefaultTableView()
  }
)

When(
  '{string} selects the display options',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    await a11yObject.showDisplayOptions()
  }
)

Then(
  '{string} should not encounter any automatically detectable accessibility issues concerning the display options menu',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getAccessibilityConformityViolations(
      selectors.displayOptionsMenu
    )
    expect(a11yViolations).toMatchObject([])
  }
)

Given(
  '{string} closes the display options menu',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    await a11yObject.closeDisplayOptions()
  }
)

When(
  '{string} opens the files context menu',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    await a11yObject.openFilesContextMenu()
  }
)

Then(
  '{string} should not encounter any automatically detectable accessibility issues concerning the files context menu',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getAccessibilityConformityViolations(
      selectors.contextMenuDropWhitespace
    )
    expect(a11yViolations).toMatchObject([])
  }
)

Given(
  '{string} exits the files context menu',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    await a11yObject.exitContextMenu()
  }
)

When('{string} selects new', async function (this: World, stepUser: string): Promise<void> {
  const { page } = this.actorsEnvironment.getActor({ key: stepUser })

  const a11yObject = new objects.a11y.Accessibility({ page })
  await a11yObject.selectNew()
})

Then(
  '{string} should not encounter any automatically detectable accessibility issues concerning the new context menu',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getAccessibilityConformityViolations(
      selectors.newResourceContextMenu
    )
    expect(a11yViolations).toMatchObject([])
  }
)

When(
  '{string} selects the folder option within the new context menu',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    await a11yObject.selectFolderOptionWithinNew()
  }
)

Then(
  '{string} should not encounter any automatically detectable accessibility issues concerning the create new folder popup',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getAccessibilityConformityViolations(selectors.ocModal)
    expect(a11yViolations).toMatchObject([])
  }
)

Given(
  '{string} cancels creating a new folder',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    await a11yObject.cancelCreatingNewFolder()
  }
)

When('{string} selects upload', async function (this: World, stepUser: string): Promise<void> {
  const { page } = this.actorsEnvironment.getActor({ key: stepUser })

  const a11yObject = new objects.a11y.Accessibility({ page })
  await a11yObject.selectUpload()
})

Then(
  '{string} should not encounter any automatically detectable accessibility issues concerning the upload context menu',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getAccessibilityConformityViolations(
      selectors.uploadContextMenu
    )
    expect(a11yViolations).toMatchObject([])
  }
)

Given(
  '{string} exits the upload menu',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    await a11yObject.exitContextMenu()
  }
)

When(
  '{string} selects a file by selecting the corresponding checkbox',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    await a11yObject.selectFileThroughCheckbox()
  }
)

Then(
  '{string} should not encounter any automatically detectable accessibility issues concerning the file actions buttons for that file',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getAccessibilityConformityViolations(
      selectors.appbarBatchActions
    )
    expect(a11yViolations).toMatchObject([])
  }
)

Given('{string} deselects the file', async function (this: World, stepUser: string): Promise<void> {
  const { page } = this.actorsEnvironment.getActor({ key: stepUser })

  const a11yObject = new objects.a11y.Accessibility({ page })
  await a11yObject.deselectFileThroughCheckbox()
})

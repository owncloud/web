import { Given, When, Then } from '@cucumber/cucumber'
import { World } from '../../environment'
import { objects } from '../../../support'
import { config } from '../../../config'

import { api } from '../../../support'
import AxeBuilder from '@axe-core/playwright'


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
    filesSpaceTableCondensed: '#files-space-table.condensed',
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
    uploadContextMenu: '.files-app-bar-actions .tippy-content',
    appbarBatchActions: '#oc-appbar-batch-actions',
}


// Scenario: check accessibility of files view
Then('{string} should not encounter any automatically detectable accessibility issues concerning the files section in default table view', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    /*
    const a11yResult = await new AxeBuilder({ page })
        .include(selectors.files)
        .exclude(selectors.resourceTableEditName) // buttons must have discernible text
        .exclude(selectors.resourceIconLink) // buttons/links must have discernible text
        .analyze()

    expect(a11yResult.violations).toEqual([])
    */
    const a11yObject = new objects.a11y.Accessibility({ page })
    const isAccessibilityConform = await a11yObject.checkAccessibilityConformity(
      selectors.files,
      [selectors.resourceTableEditName, selectors.resourceIconLink]
      )

    // excluded for known accessibility issues
    // selectors.resourceTableEditName --> buttons must have discernible text
    // selectors.resourceIconLink --> buttons/links must have discernible text

    expect(isAccessibilityConform).toBe(true)
})

When('{string} switches to the condensed table view', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    a11yObject.switchToCondensedTableView()
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the files section in condensed table view', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    const isAccessibilityConform = await a11yObject.checkAccessibilityConformity(
      selectors.filesSpaceTableCondensed,
      [selectors.resourceTableEditName, selectors.resourceIconLink]
      )

    // excluded for known accessibility issues
    // selectors.resourceTableEditName --> buttons must have discernible text
    // selectors.resourceIconLink --> buttons/links must have discernible text

    expect(isAccessibilityConform).toBe(true)
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the files section in tiles view', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    const isAccessibilityConform = await a11yObject.checkAccessibilityConformity(
      selectors.tilesView,
      selectors.cardMediaTop
      )

    // excluded for known accessibility issues
    // selectors.cardMediaTop --> issue with tiles with picture preview, element has focusable descendants

    expect(isAccessibilityConform).toBe(true)
})

Then('{string} switches to the default table view', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    a11yObject.switchToDefaultTableView()
})

When('{string} selects the display options', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    /*
    // ensure files section is visible
    await page.locator(selectors.files).waitFor()
    // select display options
    await page.locator(selectors.filesViewOptionsBtn).click()
    await page.locator(selectors.displayOptionsMenu).last().waitFor() // first element contains the invisible state, last the visible state
    */
    const a11yObject = new objects.a11y.Accessibility({ page })
    a11yObject.showDisplayOptions()
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the display options menu', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    /*
    const a11yResult = await new AxeBuilder({ page })
        .include(selectors.displayOptionsMenu)
        .analyze()

    expect(a11yResult.violations).toEqual([])
    */
    const a11yObject = new objects.a11y.Accessibility({ page })
    const isAccessibilityConform = await a11yObject.checkAccessibilityConformity(selectors.displayOptionsMenu)
    expect(isAccessibilityConform).toBe(true)
})

Then('{string} closes the display options menu', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    /*
    // click on display options (again)
    await page.locator(selectors.filesViewOptionsBtn).click()
    */
    const a11yObject = new objects.a11y.Accessibility({ page })
    a11yObject.closeDisplayOptions()
})

When('{string} opens the files context menu', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    /*
    // ensure files section is visible
    await page.locator(selectors.files).waitFor()
    // right click to get context menu with "new folder" and "details" context menu
    await page.locator(selectors.webContentMain).click({ button: 'right' })
    await page.locator(selectors.contextMenuDropWhitespace).waitFor()
    */
    const a11yObject = new objects.a11y.Accessibility({ page })
    a11yObject.openFilesContextMenu()
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the files context menu', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    /*
    const a11yResult = await new AxeBuilder({ page })
        .include(selectors.contextMenuDropWhitespace)
        .analyze()

    expect(a11yResult.violations).toEqual([])
    */
    const a11yObject = new objects.a11y.Accessibility({ page })
    const isAccessibilityConform = await a11yObject.checkAccessibilityConformity(selectors.contextMenuDropWhitespace)
    expect(isAccessibilityConform).toBe(true)
})

Then('{string} exits the files context menu', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    /*
    // ensure files section is visible
    await page.locator(selectors.files).waitFor()
    // left (regular) mouse click
    await page.locator(selectors.webContentMain).click()
    */
    const a11yObject = new objects.a11y.Accessibility({ page })
    a11yObject.exitContextMenu()
})

When('{string} selects new', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    /*
    // ensure files section is visible
    await page.locator(selectors.files).waitFor()
    // click on "+ new" button
    await page.locator(selectors.newFileMenuBtn).click()
    await page.locator(selectors.newResourceContextMenu).waitFor()
    */
    const a11yObject = new objects.a11y.Accessibility({ page })
    a11yObject.selectNew()
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the new context menu', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    /*
    const a11yResult = await new AxeBuilder({ page })
        .include(selectors.newResourceContextMenu)
        .analyze()

    expect(a11yResult.violations).toEqual([])
    */
    const a11yObject = new objects.a11y.Accessibility({ page })
    const isAccessibilityConform = await a11yObject.checkAccessibilityConformity(selectors.newResourceContextMenu)
    expect(isAccessibilityConform).toBe(true)
})

When('{string} selects the folder option within the new context menu', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    /*
    // ensure that the context menu is visible
    await page.locator(selectors.newResourceContextMenu).waitFor()
    // click on "folder"
    await page.locator(selectors.newFolderBtn).click()
    await page.locator(selectors.ocModal).waitFor()
    */
    const a11yObject = new objects.a11y.Accessibility({ page })
    a11yObject.selectFolderOptionWithinNew()
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the create new folder popup', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    /*
    const a11yResult = await new AxeBuilder({ page })
        .include(selectors.ocModal)
        .analyze()

    expect(a11yResult.violations).toEqual([])
    */
    const a11yObject = new objects.a11y.Accessibility({ page })
    const isAccessibilityConform = await a11yObject.checkAccessibilityConformity(selectors.ocModal)
    expect(isAccessibilityConform).toBe(true)
})

Then('{string} cancels creating a new folder', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    //await page.locator('.oc-modal-body-actions-cancel').click()
    const a11yObject = new objects.a11y.Accessibility({ page })
    a11yObject.cancelCreatingNewFolder()
})

When('{string} selects upload', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    a11yObject.selectUpload()
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the upload context menu', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    /*
    const a11yResult = await new AxeBuilder({ page })
        .include('.files-app-bar-actions .tippy-content')
        .analyze()

    expect(a11yResult.violations).toEqual([])
    */
    const a11yObject = new objects.a11y.Accessibility({ page })
    const isAccessibilityConform = await a11yObject.checkAccessibilityConformity(selectors.uploadContextMenu)
    expect(isAccessibilityConform).toBe(true)

})

// same as "exits the files context menu"
Then('{string} exits the upload menu', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    /*
    // ensure files section is visible
    await page.locator(selectors.files).waitFor()
    // left (regular) mouse click
    await page.locator(selectors.webContentMain).click()
    */
    const a11yObject = new objects.a11y.Accessibility({ page })
    a11yObject.exitContextMenu()
})

When('{string} selects a file by selecting the corresponding checkbox', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    a11yObject.selectFileThroughCheckbox()
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the file actions buttons for that file', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    /*
    // check a11y of download, cut, copy & delete buttons
    const a11yResult = await new AxeBuilder({ page })
        .include('#oc-appbar-batch-actions')
        .analyze()

    expect(a11yResult.violations).toEqual([])
    */
    const a11yObject = new objects.a11y.Accessibility({ page })
    const isAccessibilityConform = await a11yObject.checkAccessibilityConformity(selectors.appbarBatchActions)
    expect(isAccessibilityConform).toBe(true)
})

Then('{string} deselects the file', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yObject = new objects.a11y.Accessibility({ page })
    a11yObject.deselectFileThroughCheckbox()
})

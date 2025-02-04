import { Page } from '@playwright/test'
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
  filesSpaceTableCondensed: '.condensed.files-table', //'#files-space-table .condensed',
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

export const checkAccessibilityConformity = async (args: {
  page: Page
  include: string
}): Promise<boolean> => {
  const { page, include } = args

  //console.log('scope: ' + include)

  await page.waitForTimeout(2000)
  const a11yResult = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
    // decide which tags should be included in the default configuration
    .include(include)
    .analyze()

  if (JSON.stringify(a11yResult.violations) == JSON.stringify([])) {
    return true
  }

  return false
}

export const checkAccessibilityConformityWithException = async (args: {
  page: Page
  include: string
  exclude: string
}): Promise<boolean> => {
  const { page, include, exclude } = args

  //console.log('scope: ' + include)
  //console.log('exceptions: ' + exclude)

  await page.waitForTimeout(2000)
  const a11yResult = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
    // decide which tags should be included in the default configuration
    .include(include)
    .exclude(exclude)
    .analyze()

  if (JSON.stringify(a11yResult.violations) == JSON.stringify([])) {
    return true
  }

  return false
}

export const checkAccessibilityConformityWith2Exceptions = async (args: {
  page: Page
  include: string
  exclude: string
  exclude2: string
}): Promise<boolean> => {
  const { page, include, exclude, exclude2 } = args

  //console.log('scope: ' + include)
  //console.log('exceptions: ' + exclude + ', ' + exclude2)

  await page.waitForTimeout(2000)
  const a11yResult = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
    // decide which tags should be included in the default configuration
    .include(include)
    .exclude(exclude)
    .exclude(exclude2)
    .analyze()

  if (JSON.stringify(a11yResult.violations) == JSON.stringify([])) {
    return true
  }

  return false
}

export const switchToCondensedTableView = async (args: { page: Page }): Promise<void> => {
  const { page } = args
  // ensure files is visible
  await page.locator(selectors.files).waitFor()
  // switch to condensed table view
  await page.locator(selectors.resourceTableCondensed).click()
  await page.locator(selectors.filesSpaceTableCondensed).waitFor()
}

export const switchToDefaultTableView = async (args: { page: Page }): Promise<void> => {
  const { page } = args
  // ensure files is visible
  await page.locator(selectors.files).waitFor()
  // switch to default table view
  await page.locator(selectors.resourceTable).click()
  await page.locator(selectors.filesSpaceTable).waitFor()
}

export const showDisplayOptions = async (args: { page: Page }): Promise<void> => {
  const { page } = args
  // ensure files is visible
  await page.locator(selectors.files).waitFor()
  // select display options
  await page.locator(selectors.filesViewOptionsBtn).click()
  await page.locator(selectors.displayOptionsMenu).last().waitFor() // first element contains the invisible state, last the visible state
}

export const closeDisplayOptions = async (args: { page: Page }): Promise<void> => {
  const { page } = args
  // click on display options (again)
  await page.locator(selectors.filesViewOptionsBtn).click()
}

export const openFilesContextMenu = async (args: { page: Page }): Promise<void> => {
  const { page } = args
  // ensure files section is visible
  await page.locator(selectors.files).waitFor()
  // right click to get context menu with "new folder" and "details" context menu
  await page.locator(selectors.webContentMain).click({ button: 'right' })
  await page.locator(selectors.contextMenuDropWhitespace).waitFor()
}

export const exitContextMenu = async (args: { page: Page }): Promise<void> => {
  const { page } = args
  // ensure files section is visible
  await page.locator(selectors.files).waitFor()
  // left (regular) mouse click
  await page.locator(selectors.webContentMain).click()
}

export const selectNew = async (args: { page: Page }): Promise<void> => {
  const { page } = args
  // ensure files section is visible
  await page.locator(selectors.files).waitFor()
  // click on "+ new" button
  await page.locator(selectors.newFileMenuBtn).click()
  await page.locator(selectors.newResourceContextMenu).waitFor()
}

export const selectFolderOptionWithinNew = async (args: { page: Page }): Promise<void> => {
  const { page } = args
  // ensure that the context menu is visible
  await page.locator(selectors.newResourceContextMenu).waitFor()
  // click on "folder"
  await page.locator(selectors.newFolderBtn).click()
  await page.locator(selectors.ocModal).waitFor()
}

export const cancelCreatingNewFolder = async (args: { page: Page }): Promise<void> => {
  const { page } = args
  await page.locator(selectors.ocModalCancel).click()
}

export const selectUpload = async (args: { page: Page }): Promise<void> => {
  const { page } = args
  // ensure files section is visible
  await page.locator(selectors.files).waitFor()
  // click on "upload" button
  await page.locator(selectors.uploadMenuBtn).click()
  await page.locator(selectors.uploadContextMenu).waitFor()
}

export const checkFileCheckbox = async (args: { page: Page }): Promise<void> => {
  const { page } = args
  // ensure files section is visible
  await page.locator(selectors.files).waitFor()
  // check checkbox of the first file in the list
  await page.locator(selectors.filesSpaceTableCheckbox).first().check()
  await page.locator(selectors.appbarBatchActions).waitFor()
}

export const uncheckFileCheckbox = async (args: { page: Page }): Promise<void> => {
  const { page } = args
  // ensure files section is visible
  await page.locator(selectors.files).waitFor()
  // check checkbox of the first file in the list
  await page.locator(selectors.filesSpaceTableCheckbox).first().uncheck()
}

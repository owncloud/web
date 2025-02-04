import { Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

export const selectors = {
  files: '#files',
  resourceTableEditName: '.resource-table-edit-name',
  resourceIconLink: '.oc-resource-icon-link',
  resourceTableCondensedIcon: '.resource-table-condensed',
  filesSpaceTableCondensed: '#files-space-table.condensed', // '.condensed.files-table',
  resourceTiles: '.resource-tiles',
  tilesView: '#tiles-view',
  cardMediaTop: '.oc-card-media-top',
  resourceTableIcon: '.resource-table',
  filesSpaceTable: '#files-space-table',
  filesViewOptionsBtn: '#files-view-options-btn',
  displayOptionsMenu: '#files-app-bar-controls-right .tippy-content',
  webContentMain: '#web-content-main',
  filesContextMenu: '#context-menu-drop-whitespace',
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

const a11yRuleTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']
// decide which tags should be included in the default configuration of axebuilder

export const analyzeAccessibilityConformityViolations = async (args: {
  page: Page
  include: string
}): Promise<any> => {
  const { page, include } = args

  const a11yResult = await new AxeBuilder({ page })
    .withTags(a11yRuleTags)
    .include(include)
    .analyze()

  return a11yResult.violations
}

export const analyzeAccessibilityConformityViolationsWithExclusions = async (args: {
  page: Page
  include: string
  exclude: string | string[]
}): Promise<any> => {
  const { page, include, exclude } = args

  const axeBuilder = new AxeBuilder({ page }).withTags(a11yRuleTags).include(include)

  if (typeof exclude == 'string') {
    // excluding single selector
    axeBuilder.exclude(exclude)
  } else {
    // excluding multiple selectors
    for (const e in exclude) {
      axeBuilder.exclude(exclude[e])
    }
  }

  const a11yResult = await axeBuilder.analyze()

  return a11yResult.violations
}

export const switchToCondensedTableView = async (args: { page: Page }): Promise<void> => {
  const { page } = args

  await page.locator(selectors.files).waitFor()
  await page.locator(selectors.resourceTableCondensedIcon).click()
  await page.locator(selectors.filesSpaceTableCondensed).waitFor()
}

export const switchToDefaultTableView = async (args: { page: Page }): Promise<void> => {
  const { page } = args

  await page.locator(selectors.files).waitFor()
  await page.locator(selectors.resourceTableIcon).click()
  await page.locator(selectors.filesSpaceTable).waitFor()
}

export const showDisplayOptions = async (args: { page: Page }): Promise<void> => {
  const { page } = args

  await page.locator(selectors.files).waitFor()
  await page.locator(selectors.filesViewOptionsBtn).click()
  await page.locator(selectors.displayOptionsMenu).last().waitFor() // first element contains the invisible state, last the visible state
}

export const closeDisplayOptions = async (args: { page: Page }): Promise<void> => {
  const { page } = args

  await page.locator(selectors.filesViewOptionsBtn).click()
}

export const openFilesContextMenu = async (args: { page: Page }): Promise<void> => {
  const { page } = args

  await page.locator(selectors.files).waitFor()
  // right click to get context menu with "new folder" and "details" context menu
  await page.locator(selectors.webContentMain).click({ button: 'right' })
  await page.locator(selectors.filesContextMenu).waitFor()
}

export const exitContextMenu = async (args: { page: Page }): Promise<void> => {
  const { page } = args

  await page.locator(selectors.files).waitFor()
  await page.locator(selectors.webContentMain).click()
}

export const selectNew = async (args: { page: Page }): Promise<void> => {
  const { page } = args

  await page.locator(selectors.files).waitFor()
  await page.locator(selectors.newFileMenuBtn).click()
  await page.locator(selectors.newResourceContextMenu).waitFor()
}

export const selectFolderOptionWithinNew = async (args: { page: Page }): Promise<void> => {
  const { page } = args

  await page.locator(selectors.newResourceContextMenu).waitFor()
  await page.locator(selectors.newFolderBtn).click()
  await page.locator(selectors.ocModal).waitFor()
}

export const cancelCreatingNewFolder = async (args: { page: Page }): Promise<void> => {
  const { page } = args

  await page.locator(selectors.ocModalCancel).click()
}

export const selectUpload = async (args: { page: Page }): Promise<void> => {
  const { page } = args

  await page.locator(selectors.files).waitFor()
  await page.locator(selectors.uploadMenuBtn).click()
  await page.locator(selectors.uploadContextMenu).waitFor()
}

export const checkFileCheckbox = async (args: { page: Page }): Promise<void> => {
  const { page } = args

  await page.locator(selectors.files).waitFor()
  // check checkbox of the first file in the list
  await page.locator(selectors.filesSpaceTableCheckbox).first().check()
  await page.locator(selectors.appbarBatchActions).waitFor()
}

export const uncheckFileCheckbox = async (args: { page: Page }): Promise<void> => {
  const { page } = args

  await page.locator(selectors.files).waitFor()
  await page.locator(selectors.filesSpaceTableCheckbox).first().uncheck()
}

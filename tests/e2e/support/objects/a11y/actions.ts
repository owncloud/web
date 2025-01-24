import { Page, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import util from 'util'
import { config } from '../../../config'

// locators

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
}

export const checkAccessibilityConformity = async (args: { page: Page; include: string; exclude: string | string[] }): Promise<boolean> => {
  const { page, include, exclude } = args

  const a11yResult = await new AxeBuilder({ page })
      .include(include)
      .exclude(exclude)
      .analyze()

  if (JSON.stringify(a11yResult.violations) == JSON.stringify([])){
    console.log('accessability conformity true')
    return true
  }
  
  console.log('accessability conformity false')
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

/*
export const showDisplayOptions = async (args: { page: Page }): Promise<void> => {
  const { page } = args
  // ensure files is visible
  await page.locator(selectors.files).waitFor()
  // select display options
  await page.locator(selectors.filesViewOptionsBtn).click() 
  await page.locator(selectors.displayOptionsMenu).last().waitFor() // first element contains the invisible state, last the visible state
}
*/

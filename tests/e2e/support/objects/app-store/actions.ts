import { Download, Page } from '@playwright/test'
import util from 'util'
import { objects } from '../..'
import { World } from '../../../cucumber/environment/world'
import { expect } from '@playwright/test'

const selectors = {
  appLoadingSpinner: '#app-loading-spinner',
  appSwitcherButton: '#_appSwitcherButton',
  appStoreMenuButton: 'data-test-id=app.app-store.menuItem',
  downloadButton: '//a[contains(., "%s")]/ancestor::li//button[.//span[text()="Download"]]',
  downloadVersionButton: '//tr[@data-item-id="%s"]//button[.//span[text()="Download"]]',
  appStoreHeadline: '.app-list-headline',
  appTileTitle: '.app-tile-title',
  selectAppTitle: '//a[contains(.,"%s")]',
  appDetailsBack: '.app-details-back',
  appDetailsTitle: '//h2[contains(@class, "app-details-title")][text()="%s"]',
  appsFilter: '#apps-filter',
  tag: '//button[contains(@class,"oc-tag")][span[text()="%s"]]',
  appTag: '//a[contains(.,"%s")]/following::button[contains(@class,"oc-tag")][span[text()="%s"]][1]'
}

export const openAppStore = async (args: { page: Page; world: World }): Promise<void> => {
  const { page, world } = args
  await page.locator(selectors.appSwitcherButton).click()
  const a11yObject = new objects.a11y.Accessibility({ page })
  const a11yViolations = await a11yObject.getSevereAccessibilityViolations(
    selectors.appSwitcherButton
  )
  world.currentStepData = {
    a11yViolations
  }
  expect(a11yViolations).toMatchObject([])
  await page.locator(selectors.appStoreMenuButton).click()
  await objects.a11y.Accessibility.assertNoSevereA11yViolations(
    page,
    ['appStore'],
    'app store page',
    world
  )
  await page.locator(selectors.appLoadingSpinner).waitFor({ state: 'detached' })
}
export const navigateToAppStoreOverview = async (args: {
  page: Page
  world: World
}): Promise<void> => {
  const { page, world } = args
  await objects.a11y.Accessibility.assertNoSevereA11yViolations(
    page,
    ['appDetails'],
    'app details page',
    world
  )
  await page.locator(selectors.appDetailsBack).click()
  await page.locator(selectors.appDetailsBack).waitFor({ state: 'detached' })
  await objects.a11y.Accessibility.assertNoSevereA11yViolations(
    page,
    ['appStore'],
    'app store page',
    world
  )
}

export const waitForAppStoreIsVisible = async (args: {
  page: Page
  world: World
}): Promise<void> => {
  const { page, world } = args
  await page.locator(selectors.appStoreHeadline).waitFor()
  const a11yObject = new objects.a11y.Accessibility({ page })
  const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
  world.currentStepData = {
    a11yViolations
  }
  expect(a11yViolations).toMatchObject([])
  return
}

export const getAppsList = async (args: { page: Page; world: World }): Promise<string[]> => {
  const { page, world } = args
  await objects.a11y.Accessibility.assertNoSevereA11yViolations(
    page,
    ['appStore'],
    'app store page',
    world
  )
  return page.locator(selectors.appTileTitle).allTextContents()
}

export const setSearchTerm = async (args: {
  page: Page
  searchTerm: string
  world: World
}): Promise<void> => {
  const { page, searchTerm, world } = args
  await objects.a11y.Accessibility.assertNoSevereA11yViolations(
    page,
    ['appStore'],
    'app store page',
    world
  )
  return page.locator(selectors.appsFilter).fill(searchTerm)
}

export const selectAppTag = async (args: {
  page: Page
  app: string
  tag: string
  world: World
}): Promise<void> => {
  const { page, app, tag, world } = args
  await objects.a11y.Accessibility.assertNoSevereA11yViolations(
    page,
    ['appStore'],
    'app store page',
    world
  )
  return page.locator(util.format(selectors.appTag, app, tag)).click()
}
export const selectTag = async (args: { page: Page; tag: string; world: World }): Promise<void> => {
  const { page, tag, world } = args
  await objects.a11y.Accessibility.assertNoSevereA11yViolations(
    page,
    ['appStore'],
    'app store page',
    world
  )
  return page.locator(util.format(selectors.tag, tag)).click()
}

export const selectApp = async (args: { page: Page; app: string; world: World }): Promise<void> => {
  const { page, app, world } = args
  await page.locator(util.format(selectors.selectAppTitle, app)).click()
  const a11yObject = new objects.a11y.Accessibility({ page })
  const a11yViolations = await a11yObject.getSevereAccessibilityViolations('#app-store')
  world.currentStepData = {
    a11yViolations
  }
  expect(a11yViolations).toMatchObject([])
  return
}

export const waitForAppDetailsIsVisible = async (args: {
  page: Page
  app
  world: World
}): Promise<void> => {
  const { page, app, world } = args
  await page.locator(util.format(selectors.appDetailsTitle, app)).waitFor()
  await objects.a11y.Accessibility.assertNoSevereA11yViolations(
    page,
    ['appDetails'],
    'app details page',
    world
  )
}

export const downloadAppVersion = async (args: {
  page: Page
  version: string
  world: World
}): Promise<string> => {
  const { page, version, world } = args
  await objects.a11y.Accessibility.assertNoSevereA11yViolations(
    page,
    ['appDetails'],
    'app details page',
    world
  )
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator(util.format(selectors.downloadVersionButton, version)).click()
  ])
  return download.suggestedFilename()
}

export const downloadApp = async (args: {
  page: Page
  app: string
  world: World
}): Promise<Download> => {
  const { page, app, world } = args
  await objects.a11y.Accessibility.assertNoSevereA11yViolations(
    page,
    ['appDetails'],
    'app details page',
    world
  )
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator(util.format(selectors.downloadButton, app)).click()
  ])

  return download
}

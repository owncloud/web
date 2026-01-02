import { Download, Page, expect } from '@playwright/test'
import util from 'util'
import { objects } from '../..'

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

export const openAppStore = async (args: { page: Page }): Promise<void> => {
  const { page } = args
  await page.locator(selectors.appSwitcherButton).click()
  const a11yObject = new objects.a11y.Accessibility({ page })
  let violations = await a11yObject.getSevereAccessibilityViolations(
    a11yObject.getSelectors().appSwitcherDropdown
  )
  await page.locator(selectors.appStoreMenuButton).click()
  violations = [
    ...violations,
    ...(await a11yObject.getSevereAccessibilityViolations(a11yObject.getSelectors().appStore))
  ]
  expect(
    violations,
    `Found ${violations.length} severe accessibility violations in app store page or app switcher dropdown`
  ).toHaveLength(0)
  await page.locator(selectors.appLoadingSpinner).waitFor({ state: 'detached' })
}
export const navigateToAppStoreOverview = async (args: { page: Page }): Promise<void> => {
  const { page } = args
  const a11yObject = new objects.a11y.Accessibility({ page })
  let violations = await a11yObject.getSevereAccessibilityViolations(
    a11yObject.getSelectors().appDetails
  )
  await page.locator(selectors.appDetailsBack).click()
  await page.locator(selectors.appDetailsBack).waitFor({ state: 'detached' })
  violations = [
    ...violations,
    ...(await a11yObject.getSevereAccessibilityViolations(a11yObject.getSelectors().appStore))
  ]
  expect(
    violations,
    `Found ${violations.length} severe accessibility violations in app store page or app switcher dropdown`
  ).toHaveLength(0)
}

export const waitForAppStoreIsVisible = async (args: { page: Page }): Promise<void> => {
  const { page } = args
  await page.locator(selectors.appStoreHeadline).waitFor()
  const a11yObject = new objects.a11y.Accessibility({ page })
  const a11yViolations = await a11yObject.getSevereAccessibilityViolations(
    a11yObject.getSelectors().appStore
  )
  expect(
    a11yViolations,
    `Found ${a11yViolations.length} severe accessibility violations in app store page`
  ).toHaveLength(0)
}

export const getAppsList = async (args: { page: Page }): Promise<string[]> => {
  const { page } = args
  const a11yObject = new objects.a11y.Accessibility({ page })
  const a11yViolations = await a11yObject.getSevereAccessibilityViolations(
    a11yObject.getSelectors().appStore
  )
  expect(
    a11yViolations,
    `Found ${a11yViolations.length} severe accessibility violations in app store page`
  ).toHaveLength(0)
  return page.locator(selectors.appTileTitle).allTextContents()
}

export const setSearchTerm = async (args: { page: Page; searchTerm: string }): Promise<void> => {
  const { page, searchTerm } = args
  const a11yObject = new objects.a11y.Accessibility({ page })
  const a11yViolations = await a11yObject.getSevereAccessibilityViolations(
    a11yObject.getSelectors().appStore
  )
  expect(
    a11yViolations,
    `Found ${a11yViolations.length} severe accessibility violations in app store page`
  ).toHaveLength(0)
  return page.locator(selectors.appsFilter).fill(searchTerm)
}

export const selectAppTag = async (args: {
  page: Page
  app: string
  tag: string
}): Promise<void> => {
  const { page, app, tag } = args
  const a11yObject = new objects.a11y.Accessibility({ page })
  const a11yViolations = await a11yObject.getSevereAccessibilityViolations(
    a11yObject.getSelectors().appStore
  )
  expect(
    a11yViolations,
    `Found ${a11yViolations.length} severe accessibility violations in app store page`
  ).toHaveLength(0)
  return page.locator(util.format(selectors.appTag, app, tag)).click()
}
export const selectTag = async (args: { page: Page; tag: string }): Promise<void> => {
  const { page, tag } = args
  const a11yObject = new objects.a11y.Accessibility({ page })
  const a11yViolations = await a11yObject.getSevereAccessibilityViolations(
    a11yObject.getSelectors().appStore
  )
  expect(
    a11yViolations,
    `Found ${a11yViolations.length} severe accessibility violations in app store page`
  ).toHaveLength(0)
  return page.locator(util.format(selectors.tag, tag)).click()
}

export const selectApp = async (args: { page: Page; app: string }): Promise<void> => {
  const { page, app } = args
  const a11yObject = new objects.a11y.Accessibility({ page })
  let violations = await a11yObject.getSevereAccessibilityViolations(
    a11yObject.getSelectors().appStore
  )
  await page.locator(util.format(selectors.selectAppTitle, app)).click()
  violations = [
    ...violations,
    ...(await a11yObject.getSevereAccessibilityViolations(a11yObject.getSelectors().appDetails))
  ]
  expect(
    violations,
    `Found ${violations.length} severe accessibility violations in app store page or app switcher dropdown`
  ).toHaveLength(0)
}

export const waitForAppDetailsIsVisible = async (args: { page: Page; app }): Promise<void> => {
  const { page, app } = args
  await page.locator(util.format(selectors.appDetailsTitle, app)).waitFor()
  const a11yObject = new objects.a11y.Accessibility({ page })
  const a11yViolations = await a11yObject.getSevereAccessibilityViolations(
    a11yObject.getSelectors().appDetails
  )
  expect(
    a11yViolations,
    `Found ${a11yViolations.length} severe accessibility violations in app details page`
  ).toHaveLength(0)
}

export const downloadAppVersion = async (args: {
  page: Page
  version: string
}): Promise<string> => {
  const { page, version } = args
  const a11yObject = new objects.a11y.Accessibility({ page })
  const a11yViolations = await a11yObject.getSevereAccessibilityViolations(
    a11yObject.getSelectors().appDetails
  )
  expect(
    a11yViolations,
    `Found ${a11yViolations.length} severe accessibility violations in app details page`
  ).toHaveLength(0)
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator(util.format(selectors.downloadVersionButton, version)).click()
  ])
  return download.suggestedFilename()
}

export const downloadApp = async (args: { page: Page; app: string }): Promise<Download> => {
  const { page, app } = args
  const a11yObject = new objects.a11y.Accessibility({ page })
  const a11yViolations = await a11yObject.getSevereAccessibilityViolations(
    a11yObject.getSelectors().appDetails
  )
  expect(
    a11yViolations,
    `Found ${a11yViolations.length} severe accessibility violations in app details page`
  ).toHaveLength(0)
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator(util.format(selectors.downloadButton, app)).click()
  ])

  return download
}

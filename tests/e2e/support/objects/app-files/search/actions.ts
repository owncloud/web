import { Page } from 'playwright'
import util from 'util'

const globalSearchInputSelector = '.oc-search-input'
const searchResultMessageSelector = '//p[@class="oc-text-muted"]'
const selectTagDropdownSelector =
  '//div[contains(@class,"files-search-filter-tags")]//button[contains(@class,"oc-filter-chip-button")]'
const tagFilterChipSelector = '//button[contains(@data-test-value,"%s")]'
const clearTagFilterSelector =
  '//div[contains(@class,"files-search-filter-tags")]//button[contains(@class,"oc-filter-chip-clear")]'
const enableSearchInFileContentSelector =
  '//div[contains(@class,"files-search-filter-full-text")]//button[contains(@class,"oc-filter-chip-button")]'
const disableSearchInFileContentSelector =
  '//div[contains(@class,"files-search-filter-full-text")]//button[contains(@class,"oc-filter-chip-clear")]'

export interface fullTextSearchArgs {
  keyword: string
  page: Page
}

export const fullTextSearch = async (args: fullTextSearchArgs): Promise<void> => {
  const { page, keyword } = args
  await page.locator(globalSearchInputSelector).fill(keyword)
  await page.keyboard.press('Enter')
}

export const getSearchResultMessage = ({ page }): Promise<string> => {
  return page.locator(searchResultMessageSelector).innerText()
}

export const selectTagFilter = async ({ tag, page }): Promise<void> => {
  await page.locator(selectTagDropdownSelector).click()
  await page.locator(util.format(tagFilterChipSelector, tag)).click()
}

export const clearTagFilter = async ({ page }): Promise<void> => {
  await page.locator(clearTagFilterSelector).click()
}

export const toggleSearchInFileContent = async ({ enableOrDisable, page }): Promise<void> => {
  const selector = enableOrDisable === 'enable' ? enableSearchInFileContentSelector : disableSearchInFileContentSelector
  await page.locator(selector).click()
}

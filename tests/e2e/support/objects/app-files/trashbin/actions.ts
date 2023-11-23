import { Page } from '@playwright/test'
import util from 'util'

const spaceIdSelector = '//tr[@data-item-id="%s"]//a'
export interface openTrashBinArgs {
  id: string
  page: Page
}
export const openTrashbin = async (args: openTrashBinArgs): Promise<void> => {
  const { id, page } = args
  await page.locator(util.format(spaceIdSelector, id)).click()
}

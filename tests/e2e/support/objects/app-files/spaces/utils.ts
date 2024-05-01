import { expect, Page } from '@playwright/test'
import util from 'util'

const spaceIdSelector = `[data-item-id="%s"]`

export interface searchForSpacesIdsArgs {
  spaceID: string
  page: Page
}
export const spaceWithSpaceIDNotExist = async (args: searchForSpacesIdsArgs): Promise<void> => {
  const { page, spaceID } = args
  const space = page.locator(util.format(spaceIdSelector, spaceID))
  await expect(space).not.toBeVisible()
}

export const spaceWithSpaceIDExist = async (args: searchForSpacesIdsArgs): Promise<void> => {
  const { page, spaceID } = args
  const space = page.locator(util.format(spaceIdSelector, spaceID))
  await expect(space).toBeVisible()
}

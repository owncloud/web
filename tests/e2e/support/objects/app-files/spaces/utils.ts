import { Page } from 'playwright'
import util from 'util'

const emptySpacesSelector = '//span[@data-msgid="%s"]'
const spaceIdSelector = `[data-space-id="%s"]`

export interface searchForSpacesIdsArgs {
  spaceID: string
  page: Page
}
export const spaceWithSpaceIDExist = async (args: searchForSpacesIdsArgs): Promise<boolean> => {
  const { page, spaceID } = args
  const emptySpacesMessage = "You don't have access to any spaces"

  // for empty case
  if (await page.isVisible(util.format(emptySpacesSelector, emptySpacesMessage))) {
    return true
  }
  // if more than one spaces exists
  if (!(await page.isVisible(util.format(spaceIdSelector, spaceID)))) {
    return true
  }
  return false
}

import { Page } from '@playwright/test'
import { config } from '../../../config'
import { getIdOfFileInsideSpace } from '../../api/davSpaces'
import { User } from '../../types'
import { getSpaceIdBySpaceName } from '../../api/graph'

export interface navigateToDetailsPanelOfResourceArgs {
  page: Page
  resource: string
  detailsPanel: string
  user: User
  space: string
}

export interface openResourceViaUrlArgs {
  page: Page
  resource?: string
  user: User
  space?: string
}

export const navigateToDetailsPanelOfResource = async (
  args: navigateToDetailsPanelOfResourceArgs
): Promise<void> => {
  const { page, resource, detailsPanel, user, space } = args
  const fileId = await getTheFileIdOfSpaceFile(user, space, resource)
  const fullUrl = `${config.backendUrl}/f/${fileId}?details=${detailsPanel}`
  await page.goto(fullUrl)
}

export const openResourceViaUrl = async (args: openResourceViaUrlArgs) => {
  const { page, resource, user, space } = args
  const fileId = await getTheFileIdOfSpaceFile(user, space, resource)
  const fullUrl = `${config.backendUrl}/f/${fileId}`
  await page.goto(fullUrl)
}

export const openSpaceDirectlyInTheBrowser = async (args: openResourceViaUrlArgs) => {
  const { page, user, space } = args
  let spaceName = null
  let spaceType = null
  if (space === 'personal') {
    spaceName = user.displayName
    spaceType = space
  } else {
    spaceName = space
    spaceType = 'project'
  }
  const fileId = await getSpaceIdBySpaceName({ user, spaceType, spaceName })
  const fullUrl = `${config.backendUrl}/f/${fileId}`
  await page.goto(fullUrl)
}

const getTheFileIdOfSpaceFile = async (
  user: User,
  space: string,
  pathToFileName: string
): Promise<string> => {
  let spaceName = null
  let spaceType = null
  if (space === 'personal') {
    spaceName = user.displayName
    spaceType = space
  } else {
    spaceName = space
    spaceType = 'project'
  }
  return getIdOfFileInsideSpace({
    user,
    pathToFileName,
    spaceType,
    spaceName
  })
}

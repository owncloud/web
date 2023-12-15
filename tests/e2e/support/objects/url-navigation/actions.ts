import { Page } from '@playwright/test'
import { config } from '../../../config'
import { getIdOfFileInsideSpace } from '../../api/davSpaces'
import { User } from '../../types'

export interface navigateToDetailsPanelOfResourceArgs {
  page: Page
  resource: string
  detailsPanel: string
  user: User
}

export const navigateToDetailsPanelOfResource = async (
  args: navigateToDetailsPanelOfResourceArgs
): Promise<void> => {
  const { page, resource, detailsPanel, user } = args
  const fileId = await getIdOfFileInsideSpace({
    user,
    pathToFileName: resource,
    spaceType: 'personal',
    spaceName: user.displayName
  })
  const fullUrl = `${config.backendUrl}/f/${fileId}?details=${detailsPanel}`
  await page.goto(fullUrl)
}

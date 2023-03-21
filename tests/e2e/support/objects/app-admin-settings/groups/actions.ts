import { Page } from 'playwright'

const newGroupBtn = '.admin-settings-app-bar-actions'
const createGroupInput = '#create-group-input-display-name'
const actionConfirmButton = '.oc-modal-body-actions-confirm'
const groupTrSelector = 'tr'

export const createGroup = async (args: { page: Page; key: string }): Promise<string> => {
  const { page, key } = args
  await page.locator(newGroupBtn).click()
  await page.locator(createGroupInput).fill(key)

  const [response] = await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().endsWith('groups') && resp.status() === 200 && resp.request().method() === 'POST'
    ),
    page.locator(actionConfirmButton).click()
  ])
  const group = await response.json()
  return group.id
}

export const getDisplayedGroups = async (args: { page: Page }): Promise<string[]> => {
  const { page } = args
  const groups = []
  const result = page.locator(groupTrSelector)

  const count = await result.count()
  for (let i = 0; i < count; i++) {
    groups.push(await result.nth(i).getAttribute('data-item-id'))
  }
  return groups
}

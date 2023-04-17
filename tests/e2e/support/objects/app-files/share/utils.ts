import { errors, Page } from 'playwright'
import util from 'util'
import { fileRow } from '../resource/actions'

const acceptedShareItem =
  '//*[@data-test-resource-name="%s"]/ancestor::tr//span[@data-test-user-name="%s"]'
const actionsTriggerButton =
  '//*[@data-test-resource-name="%s"]/ancestor::tr//button[contains(@class, "resource-table-btn-action-dropdown")]'
const showDetailsButton = '.oc-files-actions-show-details-trigger'

export const resourceIsNotOpenable = async ({
  page,
  resource
}: {
  page: Page
  resource: string
}): Promise<boolean> => {
  const resourceLocator = await page.locator(util.format(actionsTriggerButton, resource))
  const itemId = await resourceLocator.locator(fileRow).getAttribute('data-item-id')
  await Promise.all([
    page.waitForResponse((resp) => {
      return (
        (resp.url().endsWith(encodeURIComponent(resource)) ||
          resp.url().endsWith(encodeURIComponent(itemId))) &&
        resp.status() === 404 &&
        resp.request().method() === 'PROPFIND'
      )
    }),
    page.locator(showDetailsButton).click()
  ]).catch(() => {
    return false
  })
  return true
}

export const isAcceptedSharePresent = async ({
  page,
  resource,
  owner,
  timeout = 500
}: {
  page: Page
  resource: string
  owner: string
  timeout?: number
}): Promise<boolean> => {
  let exist = true
  await page
    .waitForSelector(util.format(acceptedShareItem, resource, owner), { timeout })
    .catch((e) => {
      if (!(e instanceof errors.TimeoutError)) {
        throw e
      }

      exist = false
    })

  return exist
}

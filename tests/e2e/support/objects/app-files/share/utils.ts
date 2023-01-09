import { errors, Page } from 'playwright'
import util from 'util'
import { resourceNameSelector, fileRow } from '../resource/actions'

const acceptedShareItem =
    '//*[@data-test-resource-name="%s"]/ancestor::tr//span[@data-test-user-name="%s"]'

export const resourceIsNotOpenable = async ({
  page,
  resource
}: {
  page: Page
  resource: string
}): Promise<boolean> => {
  const resourceLocator = await page.locator(util.format(resourceNameSelector, resource))
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
    resourceLocator.click()
  ]).catch(() => {
    return false
  })
  return true
}

export const acceptedShareExists = async ({
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

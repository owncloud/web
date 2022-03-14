import { Page, errors } from 'playwright'

export const navigateToFolder = async ({
  page,
  path
}: {
  page: Page
  path: string
}): Promise<void> => {
  const paths = path.split('/')
  for (const name of paths) {
    await page.locator(`[data-test-resource-name="${name}"]`).click()
  }
}

/**
 * one of the few places where timeout should be used, as we also use this to detect the absence of an element
 * it is not possible to differentiate between `element not there yet` and `element not loaded yet`.
 *
 * @param page
 * @param name
 * @param timeout
 */
export const resourceExists = async ({
  page,
  name,
  timeout = 500
}: {
  page: Page
  name: string
  timeout?: number
}): Promise<boolean> => {
  let exist = true
  await page.waitForSelector(`[data-test-resource-name="${name}"]`, { timeout }).catch((e) => {
    if (!(e instanceof errors.TimeoutError)) {
      throw e
    }

    exist = false
  })

  return exist
}

export const waitForResources = async ({
  page,
  names
}: {
  page: Page
  names: string[]
}): Promise<void> => {
  await Promise.all(
    names.map((name) => page.waitForSelector(`[data-test-resource-name="${name}"]`))
  )
}

export const resourceExistenceErrorMessage = (
  actionType: string,
  resourceExist: boolean,
  resource: string
): void => {
  if (actionType === '' && !resourceExist) {
    throw new Error(`resource wasn't found: "${resource}"`)
  } else if (actionType === 'not' && resourceExist) {
    throw new Error(`resource was found: "${resource}"`)
  }
}

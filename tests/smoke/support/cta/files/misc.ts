import { Page } from 'playwright'

export const navigateToFolder = async ({
  page,
  path
}: {
  page: Page
  path: string
}): Promise<void> => {
  const paths = path.split('/')

  for (const name of paths) {
    await page.click(`[data-test-resource-name="${name}"]`)
  }
}

export const resourceExists = async ({
  page,
  name
}: {
  page: Page
  name: string
}): Promise<boolean> => {
  try {
    const resource = await page.waitForSelector(`[data-test-resource-name="${name}"]`, {timeout: 100})
    return true
  } catch (error) {
    return false
  }
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

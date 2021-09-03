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
  const resource = await page.$(`[data-test-resource-name="${name}"]`)
  return !!resource
}

export const waitForResources = async ({
  page,
  names
}: {
  page: Page
  names: string[]
}): Promise<void> => {
  await Promise.all(names.map(name => page.waitForSelector(`[data-test-resource-name="${name}"]`)))
}

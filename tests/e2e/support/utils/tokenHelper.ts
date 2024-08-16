import { Browser } from '@playwright/test'
import { Session } from '../objects/runtime/session'
import { UsersEnvironment } from '../environment'
import { config } from '../../config'
import { getContinueURI } from '../api/token'

export const getTokenFromLogin = async ({
  browser,
  url = config.frontendUrl,
  username = null,
  waitForSelector = null
}: {
  browser: Browser
  url?: string
  username?: string
  waitForSelector?: string
}): Promise<void> => {
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true })
  const page = await ctx.newPage()

  username = username || 'admin'
  const loginUser = new UsersEnvironment().getUser({ key: username })

  await page.goto(url)
  await new Session({ page }).login({ user: loginUser })

  waitForSelector && (await page.locator(waitForSelector).waitFor())

  await page.close()
  await ctx.close()
}

export const getTokenFromApi = async ({ username }: { username: string }) => {
  username = username || 'admin'
  const loginUser = new UsersEnvironment().getUser({ key: username })
  await getContinueURI(loginUser)
}

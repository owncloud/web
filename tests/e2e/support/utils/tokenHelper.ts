import { Browser } from 'playwright'
import { Session } from '../objects/runtime/session'
import { TokenProviderType } from '../environment'
import { UsersEnvironment } from '../environment'
import { config } from '../../config'

export const getTokenFromLogin = async ({
  browser,
  url = config.frontendUrl,
  username = null,
  tokenType = null
}: {
  browser: Browser
  url?: string
  username?: string
  tokenType?: TokenProviderType
}): Promise<void> => {
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true })
  const page = await ctx.newPage()

  username = username || 'admin'
  const loginUser = new UsersEnvironment().getUser({ key: username })

  await page.goto(url)
  await new Session({ page }).login({ user: loginUser, tokenType })

  await page.close()
  await ctx.close()
}

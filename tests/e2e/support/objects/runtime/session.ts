import { Page } from '@playwright/test'
import { User } from '../../types'
import { config } from '../../../config'
import { TokenEnvironmentFactory, TokenProviderType } from '../../environment'

export class Session {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  signIn(username: string, password: string): Promise<void> {
    if (config.keycloak) {
      return this.keycloakSignIn(username, password)
    }
    return this.idpSignIn(username, password)
  }

  async idpSignIn(username: string, password: string): Promise<void> {
    await this.#page.locator('#oc-login-username').fill(username)
    await this.#page.locator('#oc-login-password').fill(password)
    await this.#page.locator('button[type="submit"]').click()
  }

  async keycloakSignIn(username: string, password: string): Promise<void> {
    await this.#page.locator('#username').fill(username)
    await this.#page.locator('#password').fill(password)
    await this.#page.locator('#kc-login').click()
  }

  async login({
    user,
    tokenType = null
  }: {
    user: User
    tokenType?: TokenProviderType
  }): Promise<void> {
    const { id, password } = user

    const [response] = await Promise.all([
      this.#page.waitForResponse(
        (resp) =>
          resp.url().endsWith('/token') &&
          resp.status() === 200 &&
          resp.request().method() === 'POST'
      ),
      this.signIn(id, password)
    ])

    if (!config.basicAuth) {
      const body = await response.json()
      const tokenEnvironment = TokenEnvironmentFactory(tokenType)

      tokenEnvironment.setToken({
        user: { ...user },
        token: {
          userId: user.id,
          accessToken: body.access_token,
          refreshToken: body.refresh_token
        }
      })
    }
  }

  async logout(): Promise<void> {
    await this.#page.locator('#_userMenuButton').click()
    await this.#page.locator('#oc-topbar-account-logout').click()
  }

  // async isAccessTokenValidatedUsingRefreshToken(): Promise<boolean> {
  //   // hint for improvement decode jwt token and sleep until exp time reached for safe side (skip this part because access token time is short)
  //   const response = await this.#page.waitForResponse(
  //     (resp) =>
  //       resp.url().includes('/token') && resp.status() === 200 && resp.request().method() === 'POST'
  //   )
  //   const tokenPayload = await response.request().postDataJSON()
  //   return tokenPayload.grant_type === 'refresh_token'
  // }

  // async isAccessTokenValidatedSilentlyUsingIframe(): Promise<boolean> {
  //   // for normal flow, iframe is triggered at background it happen for short time so difficult to get iframe, but we can get request which trigger iframe
  //   const [, response] = await Promise.all([
  //     this.#page.waitForResponse(
  //       (resp) =>
  //         resp.url().includes('/oidc-silent-redirect.html') &&
  //         resp.status() === 200 &&
  //         resp.request().method() === 'GET'
  //     ),
  //     this.#page.waitForResponse(
  //       (resp) =>
  //         resp.url().endsWith('/token') &&
  //         resp.status() === 200 &&
  //         resp.request().method() === 'POST'
  //     )
  //   ])
  //   const tokenPayload = await response.request().postDataJSON()
  //   return tokenPayload.grant_type === 'authorization_code'
  // }
}

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
      console.log(tokenEnvironment.getToken({user: { ...user }}))
    }
  }

  async logout(): Promise<void> {
    await this.#page.locator('#_userMenuButton').click()
    await this.#page.locator('#oc-topbar-account-logout').click()
  }

  // isTokenExpired(token) {
  //       const arrayToken = token.split('.');
  //       const tokenPayload = JSON.parse(Buffer.from(arrayToken[1], 'base64').toString('utf8'));
  //       console.log(tokenPayload)
  //       return Math.floor(new Date().getTime() / 1000) >= tokenPayload?.exp;
  // }

  async refreshToken({user}) {
      const tokenEnvironment = TokenEnvironmentFactory()
      if (config.refreshToken) {

          // const accessToken = tokenEnvironment.getToken({user: { ...user }}).accessToken
          // await this.#page.waitForTimeout(500)
          // const isTokenExp = this.isTokenExpired(accessToken)
          // console.log(isTokenExp)

          // decode jwt token and sleep until exp time reached for safe side (skip this part because access token time is short)
          const [response] = await Promise.all([
              this.#page.waitForResponse(
                  (resp) =>
                      resp.url().endsWith('/token') &&
                      resp.status() === 200 &&
                      resp.request().method() === 'POST'
              ),
          ])
          const body = await response.json()
          // once access token is renewed, token storage should be updated
          tokenEnvironment.updateToken({
              user: { ...user },
              token: {
                  ...tokenEnvironment.getToken({user}),
                  accessToken: body.access_token,
              }
          })
      }else {
          // for normal flow, iframe is triggered at background it happen for short time so difficult to get iframe but we can get request which trigger iframe
          const [,tokenResponse] = await Promise.all([
              this.#page.waitForResponse(
                  (resp) =>
                      resp.url().includes('/oidc-silent-redirect.html') &&
                      resp.status() === 200 &&
                      resp.request().method() === 'GET'
              ),
              this.#page.waitForResponse(
                  (resp) =>
                      resp.url().endsWith('/token') &&
                      resp.status() === 200 &&
                      resp.request().method() === 'POST'
              ),
          ])
          const body = await tokenResponse.json()

          tokenEnvironment.updateToken({
              user: { ...user },
              token: {
                  ...tokenEnvironment.getToken({user}),
                  accessToken: body.access_token,
              }
          })

          // Listen for iframe creation
          // this.#page.on('frameattached', async (frame) => {
          //     console.log('Frame attached:', frame.url())
          //
          //     // Wait for the frame to load
          //     await frame.waitForLoadState('load');
          //     console.log('Frame loaded:', frame.url())
          //
          //     // Perform actions with the frame
          //     // Example: Interact with an element inside the iframe
          //     // const element = await frame.$('selector');
          //     // Perform actions with the element if needed
          // });

          // Listen for frames navigating
          // this.#page.on('framenavigated', (frame) => {
          //     // console.log('Frame navigated to:', frame)
          //     console.log('Frame navigated to:', frame.url())
          // });

          // console.log(await this.#page.frameLocator('[name="iframe"]'))
          // const iframeLocator = await this.#page.frameLocator('iframe')
          // const iframeCount = await iframeLocator.count();

          // if (iframeCount > 0) {
          //     console.log('Iframe exists');
          // } else {
          //     console.log('Iframe does not exist');
          // }
      }
  }

}

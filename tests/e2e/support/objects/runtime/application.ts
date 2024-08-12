import { Page } from '@playwright/test'
import util from 'util'
import { config } from '../../../config'

const appSwitcherButton = '#_appSwitcherButton'
const appSelector = `//ul[contains(@class, "applications-list")]//*[@data-test-id="%s"]`
const notificationsBell = `#oc-notifications-bell`
const notificationsDrop = `#oc-notifications-drop`
const notificationsLoading = `#oc-notifications-drop .oc-notifications-loading`
const markNotificationsAsReadButton = `#oc-notifications-drop .oc-notifications-mark-all`
const notificationItemsMessages = `#oc-notifications-drop .oc-notifications-item .oc-notifications-message`
const closeSidebarBtn = `#app-sidebar .header__close`

export class Application {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async reloadPage(): Promise<void> {
    await this.#page.reload()
  }

  async open({ name }: { name: string }): Promise<void> {
    await this.#page.waitForTimeout(1000)
    await this.#page.locator(appSwitcherButton).click()
    await this.#page.locator(util.format(appSelector, `app.${name}.menuItem`)).click()
  }

  async getNotificationMessages(): Promise<string[]> {
    // reload will fetch notifications immediately
    // wait for the notifications to load
    await Promise.all([
      this.#page.waitForResponse(
        (resp) =>
          resp.url().endsWith('notifications') &&
          resp.status() === 200 &&
          resp.request().method() === 'GET'
      ),
      this.#page.reload()
    ])

    const dropIsOpen = await this.#page.locator(notificationsDrop).isVisible()
    if (!dropIsOpen) {
      await this.#page.locator(notificationsBell).click()
    }
    await this.#page.locator(notificationsLoading).waitFor({ state: 'detached' })
    const result = this.#page.locator(notificationItemsMessages)
    const messages = []
    const count = await result.count()
    for (let i = 0; i < count; i++) {
      messages.push(await result.nth(i).innerText())
    }
    return messages
  }

  async markNotificationsAsRead(): Promise<void> {
    const dropIsOpen = await this.#page.locator(notificationsDrop).isVisible()
    if (!dropIsOpen) {
      await this.#page.locator(notificationsBell).click()
    }
    await this.#page.locator(notificationsLoading).waitFor({ state: 'detached' })
    await this.#page.locator(markNotificationsAsReadButton).click()
    await this.#page.locator(notificationsLoading).waitFor({ state: 'detached' })
  }

  async openUrl(url): Promise<void> {
    await this.#page.goto(url)
  }

  async closeSidebar(): Promise<void> {
    const sideBarIsOpen = await this.#page.locator(closeSidebarBtn).isVisible()
    if (sideBarIsOpen) {
      await this.#page.locator(closeSidebarBtn).click()
    }
  }

  async waitForTokenRenewalViaRefreshToken(): Promise<void> {
    await Promise.all([
      this.#page.waitForResponse(
        (resp) =>
          resp.url().includes('/token') &&
          resp.status() === 200 &&
          resp.request().method() === 'POST' &&
          resp.request().postDataJSON().grant_type === 'refresh_token' &&
          resp.request().postDataJSON().hasOwnProperty('refresh_token') &&
          resp.request().postDataJSON().refresh_token &&
          resp.request().postDataJSON().hasOwnProperty('scope') &&
          resp.request().postDataJSON().scope.includes('offline_access'),
        { timeout: config.tokenTimeout * 1000 }
      )
    ])
  }

  async waitForTokenRenewalViaIframe(): Promise<void> {
    const waitForIframe = this.#page.evaluateHandle(() => {
      let iframe = null
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeName === 'IFRAME') {
                iframe = node
              }
            })
          }
        })
      })
      observer.observe(document.body, { childList: true, subtree: true })
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          if (iframe) {
            observer.disconnect()
            clearInterval(interval)
            resolve(iframe)
          }
        }, 1000)
      })
    })

    await Promise.all([
      this.#page.waitForResponse(
        (resp) =>
          resp.url().includes('/oidc-silent-redirect.html') &&
          resp.status() === 200 &&
          resp.request().method() === 'GET',
        { timeout: config.tokenTimeout * 1000 }
      ),
      this.#page.waitForResponse(
        (resp) =>
          resp.url().endsWith('/token') &&
          resp.status() === 200 &&
          resp.request().method() === 'POST' &&
          resp.request().postDataJSON().grant_type === 'authorization_code' &&
          resp.request().postDataJSON().hasOwnProperty('code') &&
          resp.request().postDataJSON().code,
        { timeout: config.tokenTimeout * 1000 }
      ),
      waitForIframe
    ])
  }
}

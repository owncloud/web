import { When } from '@cucumber/cucumber'
import { World } from '../../environment'
import { objects } from '../../../support'
import { waitForSSEEvent } from '../../../support/utils/locator'
import { config } from './../../../config'
import { Page } from '@playwright/test'

When(
  '{string} navigates to the project spaces management page',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.applicationAdminSettings.page.Spaces({ page })
    await pageObject.navigate()
  }
)

When(
  '{string} opens the {string} app',
  async function (this: World, stepUser: string, stepApp: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const applicationObject = new objects.runtime.Application({ page })
    await applicationObject.open({ name: stepApp })
  }
)

When('{string} reloads the page', async function (this: World, stepUser: string): Promise<void> {
  const { page } = this.actorsEnvironment.getActor({ key: stepUser })
  const applicationObject = new objects.runtime.Application({ page })
  await applicationObject.reloadPage()
})

When(
  '{string} should get {string} SSE event',
  async function (this: World, user: string, event: string): Promise<void> {
    await waitForSSEEvent(user, event)
  }
)

When(
  '{string} opens the {string} url',
  async function (this: World, stepUser: string, url: string): Promise<void> {
    let page: Page
    try {
      page = this.actorsEnvironment.getActor({ key: stepUser }).page
    } catch (err) {
      if (!['anonymous', 'public'].includes(stepUser.toLowerCase())) {
        throw err
      }
      page = (
        await this.actorsEnvironment.createActor({
          key: stepUser,
          namespace: this.actorsEnvironment.generateNamespace(this.feature.name, stepUser)
        })
      ).page
    }

    const applicationObject = new objects.runtime.Application({ page })
    // Initialize page context properly at base URL before navigation
    await applicationObject.openUrl(config.baseUrl)
    url = url === '%clipboard%' ? await page.evaluate('navigator.clipboard.readText()') : url
    await applicationObject.openUrl(url)
  }
)

When('{string} closes the sidebar', async function (this: World, user: string): Promise<void> {
  const { page } = this.actorsEnvironment.getActor({ key: user })
  const applicationObject = new objects.runtime.Application({ page })
  await applicationObject.closeSidebar()
})

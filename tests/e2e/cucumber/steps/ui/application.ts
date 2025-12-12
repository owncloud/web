import { When } from '@cucumber/cucumber'
import { World } from '../../environment'
import { objects } from '../../../support'
import { waitForSSEEvent } from '../../../support/utils/locator'
import { config } from './../../../config'
import { expect } from '@playwright/test'

When(
  '{string} navigates to the project spaces management page',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.applicationAdminSettings.page.Spaces({ page })
    await pageObject.navigate()
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

When(
  '{string} opens the {string} app',
  async function (this: World, stepUser: string, stepApp: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const applicationObject = new objects.runtime.Application({ page })
    await applicationObject.open({ name: stepApp, world: this })
  }
)

When('{string} reloads the page', async function (this: World, stepUser: string): Promise<void> {
  const { page } = this.actorsEnvironment.getActor({ key: stepUser })
  const applicationObject = new objects.runtime.Application({ page })
  await applicationObject.reloadPage()
  const a11yObject = new objects.a11y.Accessibility({ page })
  const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
  this.currentStepData = {
    a11yViolations
  }
  expect(a11yViolations).toMatchObject([])
})

When(
  '{string} should get {string} SSE event',
  async function (this: World, userKey: string, event: string): Promise<void> {
    const user = this.usersEnvironment.getCreatedUser({ key: userKey })
    await waitForSSEEvent(user, event)
  }
)

When(
  '{string} opens the {string} url',
  async function (this: World, stepUser: string, url: string): Promise<void> {
    const { page } = await this.actorsEnvironment.createActor({
      key: stepUser,
      namespace: this.actorsEnvironment.generateNamespace(this.feature.name, stepUser)
    })

    const applicationObject = new objects.runtime.Application({ page })
    // This is required as reading from clipboard is only possible when the browser is opened.
    await applicationObject.openUrl(config.baseUrl)
    url = url === '%clipboard%' ? await page.evaluate('navigator.clipboard.readText()') : url
    await applicationObject.openUrl(url)
    const a11yObject = new objects.a11y.Accessibility({ page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
    this.currentStepData = {
      a11yViolations
    }
    expect(a11yViolations).toMatchObject([])
  }
)

When('{string} closes the sidebar', async function (this: World, user: string): Promise<void> {
  const { page } = this.actorsEnvironment.getActor({ key: user })
  const applicationObject = new objects.runtime.Application({ page })
  await applicationObject.closeSidebar()
  const a11yObject = new objects.a11y.Accessibility({ page })
  const a11yViolations = await a11yObject.getSevereAccessibilityViolations('body')
  this.currentStepData = {
    a11yViolations
  }
  expect(a11yViolations).toMatchObject([])
})

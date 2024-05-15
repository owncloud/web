import { When } from '@cucumber/cucumber'
import { World } from '../../environment'
import { objects } from '../../../support'

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
  '{string} opens the {string} url',
  async function (this: World, stepUser: string, url: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const applicationObject = new objects.runtime.Application({ page })
    url = url === '%clipboard%' ? await page.evaluate('navigator.clipboard.readText()') : url
    await applicationObject.openUrl(url)
  }
)

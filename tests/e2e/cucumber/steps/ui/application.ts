import { When, Then, DataTable } from '@cucumber/cucumber'
import { World } from '../../environment'
import { objects } from '../../../support'
import { expect } from '@playwright/test'

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

Then(
  /^"([^"]*)" should have quota "([^"]*)"$/,
  async function (this: World, stepUser: string, quota: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const accountObject = new objects.account.Account({ page })
    const quotaValue = await accountObject.getQuotaValue()
    expect(quotaValue).toBe(quota)
  }
)

Then(
  /^"([^"]*)" should have self info:$/,
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const accountObject = new objects.account.Account({ page })

    for (const info of stepTable.hashes()) {
      expect(info.value).toBe(await accountObject.getUserInfo(info.key))
    }
  }
)

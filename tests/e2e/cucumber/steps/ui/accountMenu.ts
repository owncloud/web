import { When, Then, DataTable } from '@cucumber/cucumber'
import { World } from '../../environment'
import { objects } from '../../../support'
import { expect } from '@playwright/test'

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

When('{string} opens the user menu', async function (this: World, stepUser: string): Promise<void> {
  const { page } = this.actorsEnvironment.getActor({ key: stepUser })
  const accountObject = new objects.account.Account({ page })
  await accountObject.openAccountPage()
})

When(
  '{string} requests a new GDPR export',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const accountObject = new objects.account.Account({ page })
    await accountObject.requestGdprExport()
  }
)

When(
  '{string} downloads the GDPR export',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const accountObject = new objects.account.Account({ page })
    await accountObject.downloadGdprExport()
  }
)

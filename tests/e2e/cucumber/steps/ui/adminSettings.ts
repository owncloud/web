import { DataTable, Then, When } from '@cucumber/cucumber'
import { World } from '../../environment'
import { objects } from '../../../support'
import { expect } from '@playwright/test'

When(
  '{string} navigates to the project spaces management page',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.applicationAdminSettings.page.Spaces({ page })
    await pageObject.navigate()
  }
)

Then(
  /^"([^"]*)" (should|should not) see the following space(s)?$/,
  async function (
    this: World,
    stepUser: string,
    actionType: string,
    _: string,
    stepTable: DataTable
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const spacesObject = new objects.applicationAdminSettings.Spaces({ page })
    const actualList = await spacesObject.getDisplayedSpaces()

    for (const info of stepTable.hashes()) {
      const space = await spacesObject.getSpace({ key: info.id })
      const found = actualList.includes(space.id)
      if (actionType === 'should') {
        expect(found).toBe(true)
      } else {
        expect(found).toBe(false)
      }
    }
  }
)

When(
  /^"([^"]*)" updates the quota for space "([^"]*)" to "([^"]*)"$/,
  async function (this: World, stepUser: string, key: string, value: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const spacesObject = new objects.applicationAdminSettings.Spaces({ page })
    await spacesObject.changeQuota({ key, value })
  }
)

When(
  /^"([^"]*)" (disables|deletes) the space "([^"]*)" using the context-menu$/,
  async function (this: World, stepUser: string, action: string, key: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const spacesObject = new objects.applicationAdminSettings.Spaces({ page })

    switch (action) {
      case 'disables':
        await spacesObject.disable({ key, context: 'context-menu' })
        break
      case 'deletes':
        await spacesObject.delete({ key, context: 'context-menu' })
        break
      default:
        throw new Error(`${action} not implemented`)
    }
  }
)

When(
  /^"([^"]*)" (disables|deletes) the following space(s)? using the batch-actions$/,
  async function (
    this: World,
    stepUser: string,
    action: string,
    _: string,
    stepTable: DataTable
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const spacesObject = new objects.applicationAdminSettings.Spaces({ page })
    for (const info of stepTable.hashes()) {
      await spacesObject.select({ key: info.id })
    }
    switch (action) {
      case 'disables':
        await spacesObject.disable({ key: stepTable.hashes()[0].id, context: 'batch-actions' })
        break
      case 'deletes':
        await spacesObject.delete({ key: stepTable.hashes()[0].id, context: 'batch-actions' })
        break
      default:
        throw new Error(`${action} not implemented`)
    }
  }
)

When(
  '{string} navigates to the users management page',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.applicationAdminSettings.page.Users({ page })
    await pageObject.navigate()
  }
)

When(
  /^"([^"]*)" (allows|forbids) the login for the following user "([^"]*)" using the sidebar panel$/,
  async function (this: World, stepUser: string, action: string, key: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const usersObject = new objects.applicationAdminSettings.Users({ page })

    switch (action) {
      case 'allows':
        await usersObject.allowLogin({ key })
        break
      case 'forbids':
        await usersObject.forbidLogin({ key })
        break
      default:
        throw new Error(`${action} not implemented`)
    }
  }
)

When(
  '{string} navigates to the general management page',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.applicationAdminSettings.page.General({ page })
    await pageObject.navigate()
  }
)

Then(
  '{string} should be able to upload an logo from the local file {string}',
  async function (this: World, stepUser: string, localFile: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const generalObject = new objects.applicationAdminSettings.General({ page })
    const logoPath = this.filesEnvironment.getFile({ name: localFile.split('/').pop() }).path
    await generalObject.uploadLogo({ path: logoPath })
  }
)

Then(
  '{string} should be able to reset the logo',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const generalObject = new objects.applicationAdminSettings.General({ page })
    await generalObject.resetLogo()
  }
)

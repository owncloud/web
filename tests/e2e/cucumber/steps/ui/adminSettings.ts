import { DataTable, Then, When } from '@cucumber/cucumber'
import { World } from '../../environment'
import { api, objects } from '../../../support'
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
  '{string} should be able to upload a logo from the local file {string}',
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

When(
  /^"([^"]*)" changes the quota of the user "([^"]*)" to "([^"]*)"$/,
  async function (this: World, stepUser: string, key: string, value: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const usersObject = new objects.applicationAdminSettings.Users({ page })
    await usersObject.changeQuota({ key, value })
  }
)

When(
  /^"([^"]*)" changes the quota using a batch action to "([^"]*)" for users:$/,
  async function (
    this: World,
    stepUser: string,
    value: string,
    stepTable: DataTable
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const usersObject = new objects.applicationAdminSettings.Users({ page })
    for (const info of stepTable.hashes()) {
      await usersObject.selectUser({ key: info.id })
    }
    await usersObject.changeQuotaUsingBatchAction({ value })
  }
)

Then(
  /^"([^"]*)" (should see|should not see) the following user(s)$/,
  async function (
    this: World,
    stepUser: string,
    action: string,
    _: string,
    stepTable: DataTable
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const usersObject = new objects.applicationAdminSettings.Users({ page })
    const users = await usersObject.getDisplayedUsers()
    for (const { user } of stepTable.hashes()) {
      switch (action) {
        case 'should see':
          expect(users).toContain(usersObject.getUUID({ key: user }))
          break
        case 'should not see':
          expect(users).not.toContain(usersObject.getUUID({ key: user }))
          break
        default:
          throw new Error(`${action} not implemented`)
      }
    }
  }
)

Then(
  '{string} sets the following filter(s)',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const usersObject = new objects.applicationAdminSettings.Users({ page })

    for (const { filter, values } of stepTable.hashes()) {
      await usersObject.filter({ filter, values: values.split(',') })
    }
  }
)

When(
  /^"([^"]*)" (adds|removes) the following users (to|from) the groups "([^"]*)" using the batch actions$/,
  async function (
    this: World,
    stepUser: string,
    action: string,
    _: string,
    groups: string,
    stepTable: DataTable
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const usersObject = new objects.applicationAdminSettings.Users({ page })

    for (const { user } of stepTable.hashes()) {
      await usersObject.select({ key: user })
    }

    switch (action) {
      case 'adds':
        await usersObject.addToGroups({ groups: groups.split(',') })
        break
      case 'removes':
        await usersObject.removeFromGroups({ groups: groups.split(',') })
        break
      default:
        throw new Error(`${action} not implemented`)
    }
  }
)

When(
  /^"([^"]*)" changes (userName|displayName|email|password|role) to "([^"]*)" for user "([^"]*)" using the sidebar panel$/,
  async function (
    this: World,
    stepUser: string,
    attribute: string,
    value: string,
    user: string
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const usersObject = new objects.applicationAdminSettings.Users({ page })

    // deleting a user with a same userName before testing
    if (attribute === 'userName') {
      const newUser = this.usersEnvironment.createUser({
        key: value,
        user: {
          id: value,
          displayName: '',
          password: 'password',
          email: ''
        }
      })
      await api.graph.deleteUser({
        user: newUser,
        admin: this.usersEnvironment.getUser({ key: stepUser })
      })
    }
    await usersObject.changeUser({ key: user, attribute: attribute, value: value })
  }
)

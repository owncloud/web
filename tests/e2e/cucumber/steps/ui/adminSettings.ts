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
  /^"([^"]*)" (disables|deletes|enables) the space "([^"]*)" using the context-menu$/,
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
      case 'enables':
        await spacesObject.enable({ key, context: 'context-menu' })
        break
      default:
        throw new Error(`${action} not implemented`)
    }
  }
)

When(
  /^"([^"]*)" (changes|updates) the space "([^"]*)" (name|subtitle|quota) to "([^"]*)" using the context-menu$/,
  async function (
    this: World,
    stepUser: string,
    _: string,
    key: string,
    action: string,
    value: string
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const spacesObject = new objects.applicationAdminSettings.Spaces({ page })

    switch (action) {
      case 'name':
        await spacesObject.rename({ key, value })
        break
      case 'subtitle':
        await spacesObject.changeSubtitle({ key, value })
        break
      case 'quota':
        await spacesObject.changeQuota({ key, value, context: 'context-menu' })
        break
      default:
        throw new Error(`'${action}' not implemented`)
    }
  }
)

When(
  /^"([^"]*)" (?:changes|updates) quota of the following space(?:s)? to "([^"]*)" using the batch-actions$/,
  async function (
    this: World,
    stepUser: string,
    value: string,
    stepTable: DataTable
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const spacesObject = new objects.applicationAdminSettings.Spaces({ page })
    for (const info of stepTable.hashes()) {
      await spacesObject.select({ key: info.id })
    }
    await spacesObject.changeQuota({
      key: stepTable.hashes()[0].id,
      value,
      context: 'batch-actions'
    })
  }
)

When(
  /^"([^"]*)" (disables|enables|deletes) the following space(?:s)? using the batch-actions$/,
  async function (
    this: World,
    stepUser: string,
    action: string,
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
      case 'enables':
        await spacesObject.enable({ key: stepTable.hashes()[0].id, context: 'batch-actions' })
        break
      default:
        throw new Error(`'${action}' not implemented`)
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
  /^"([^"]*)" changes the quota of the user "([^"]*)" to "([^"]*)" using the sidebar panel$/,
  async function (this: World, stepUser: string, key: string, value: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const usersObject = new objects.applicationAdminSettings.Users({ page })
    await usersObject.changeQuota({ key, value })
  }
)

When(
  /^"([^"]*)" changes the quota to "([^"]*)" for users using the batch action$/,
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
          throw new Error(`'${action}' not implemented`)
      }
    }
  }
)

When(
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
        await usersObject.addToGroupsBatchAtion({ groups: groups.split(',') })
        break
      case 'removes':
        await usersObject.removeFromGroupsBatchAtion({ groups: groups.split(',') })
        break
      default:
        throw new Error(`'${action}' not implemented`)
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

When(
  /^"([^"]*)" (adds|removes) the user "([^"]*)" (to|from) the (group|groups) "([^"]*)" using the sidebar panel$/,
  async function (
    this: World,
    stepUser: string,
    action: string,
    user: string,
    _: string,
    __: string,
    groups: string
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const usersObject = new objects.applicationAdminSettings.Users({ page })
    switch (action) {
      case 'adds':
        await usersObject.addToGroups({ key: user, groups: groups.split(',') })
        break
      case 'removes':
        await usersObject.removeFromGroups({ key: user, groups: groups.split(',') })
        break
      default:
        throw new Error(`'${action}' not implemented`)
    }
  }
)

When(
  /^"([^"]*)" deletes the following (?:user|users) using the (batch actions|context menu)$/,
  async function (
    this: World,
    stepUser: string,
    actionType: string,
    stepTable: DataTable
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const usersObject = new objects.applicationAdminSettings.Users({ page })

    switch (actionType) {
      case 'batch actions':
        for (const user of stepTable.hashes()) {
          await usersObject.selectUser({ key: user.id })
        }
        await usersObject.deleteUserUsingBatchAction()
        break
      case 'context menu':
        for (const { user } of stepTable.hashes()) {
          await usersObject.deleteUserUsingContextMenu({ key: user })
        }
        break
      default:
        throw new Error(`'${actionType}' not implemented`)
    }
  }
)

When(
  '{string} navigates to the groups management page',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const groupsObject = new objects.applicationAdminSettings.page.Groups({ page })
    await groupsObject.navigate()
  }
)

When(
  '{string} creates the following group(s)',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const groupsObject = new objects.applicationAdminSettings.Groups({ page })

    for (const info of stepTable.hashes()) {
      const group = this.usersEnvironment.getGroup({ key: info.id })
      await api.graph.deleteGroup({
        group: group,
        admin: this.usersEnvironment.getUser({ key: stepUser })
      })
    }
    await page.reload()
    for (const info of stepTable.hashes()) {
      const group = this.usersEnvironment.getGroup({ key: info.id })
      group.uuid = await groupsObject.createGroup({ key: group.displayName })
    }
  }
)

Then(
  /^"([^"]*)" (should see|should not see) the following group(?:s)?$/,
  async function (
    this: World,
    stepUser: string,
    action: string,
    stepTable: DataTable
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const groupsObject = new objects.applicationAdminSettings.Groups({ page })
    const groups = await groupsObject.getDisplayedGroups()

    for (const { group } of stepTable.hashes()) {
      switch (action) {
        case 'should see':
          expect(groups).toContain(groupsObject.getUUID({ key: group }))
          break
        case 'should not see':
          expect(groups).not.toContain(groupsObject.getUUID({ key: group }))
          break
        default:
          throw new Error(`${action} not implemented`)
      }
    }
  }
)
When(
  '{string} creates the following user(s)',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const usersObject = new objects.applicationAdminSettings.Users({ page })
    for (const info of stepTable.hashes()) {
      const user = this.usersEnvironment.getUser({ key: info.name })
      await api.graph.deleteUser({
        user: user,
        admin: this.usersEnvironment.getUser({ key: stepUser })
      })
      await usersObject.createUser({
        name: info.name,
        displayname: info.displayname,
        email: info.email,
        password: info.password
      })
    }
  }
)

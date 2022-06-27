import { DataTable, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { World } from '../../../../environment'
import { objects } from '../../../../../support'

When(
  '{string} navigates to the projects space page',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.applicationFiles.page.spaces.Projects({ page })
    await pageObject.navigate()
  }
)

When(
  '{string} creates the following project spaces',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const spacesObject = new objects.applicationFiles.Spaces({ page })

    for (const space of stepTable.hashes()) {
      await spacesObject.create({ key: space.id || space.name, space })
    }
  }
)

When(
  '{string} navigates to the project space {string}',
  async function (this: World, stepUser: string, key: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const spacesObject = new objects.applicationFiles.Spaces({ page })

    await spacesObject.open({ key })
  }
)

When(
  /^"([^"]*)" (changes|updates) the space "([^"]*)" (name|subtitle|description|quota|image) to "([^"]*)"$/,
  async function (
    this: World,
    stepUser: string,
    _: string,
    key: string,
    action: string,
    value: string
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const spacesObject = new objects.applicationFiles.Spaces({ page })

    switch (action) {
      case 'name':
        await spacesObject.changeName({ key, value })
        break
      case 'subtitle':
        await spacesObject.changeSubtitle({ key, value })
        break
      case 'description':
        await spacesObject.changeDescription({ value })
        break
      case 'quota':
        await spacesObject.changeQuota({ key, value })
        break
      case 'image':
        await spacesObject.changeSpaceImage({
          key,
          resource: this.filesEnvironment.getFile({ name: value })
        })
        break
      default:
        throw new Error(`${action} not implemented`)
    }
  }
)

When(
  '{string} adds following users to the project space',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const spacesObject = new objects.applicationFiles.Spaces({ page })
    for (const info of stepTable.hashes()) {
      await spacesObject.addMembers({
        users: [this.usersEnvironment.getUser({ key: info.user })],
        role: info.role
      })
    }
  }
)

When(
  '{string} removes access to following users from the project space',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const spacesObject = new objects.applicationFiles.Spaces({ page })
    for (const info of stepTable.hashes()) {
      await spacesObject.removeAccessToMember({
        users: [this.usersEnvironment.getUser({ key: info.user })]
      })
    }
  }
)

Then(
  '{string} should see folder {string} but should not be able to edit',
  async function (this: World, stepUser: string, resource: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const spacesObject = new objects.applicationFiles.Spaces({ page })
    const userCanEdit = await spacesObject.canUserEditResource({ resource })
    expect(userCanEdit).toBe(false)
  }
)

Then(
  '{string} should not be able to see space {string}',
  async function (this: World, stepUser: string, space: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const spacesObject = new objects.applicationFiles.Spaces({ page })
    const spaceID = spacesObject.getSpaceID({ key: space })
    const isSpaceNotVisible = await spacesObject.spacesIdExist(spaceID)
    expect(isSpaceNotVisible).toBe(true)
  }
)

When(
  '{string} reloads the spaces page',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const spacesObject = new objects.applicationFiles.Spaces({ page })
    await spacesObject.reloadPage()
  }
)

When(
  '{string} navigates to the trashbin of the project space {string}',
  async function (this: World, stepUser: string, key: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.applicationFiles.page.spaces.Projects({ page })
    await pageObject.navigate()
    const spacesObject = new objects.applicationFiles.Spaces({ page })
    await spacesObject.openTrashbin(key)
  }
)

When(
  '{string} changes the roles of the following users in the project space',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const spacesObject = new objects.applicationFiles.Spaces({ page })
    for (const info of stepTable.hashes()) {
      await spacesObject.changeRoles({
        users: [this.usersEnvironment.getUser({ key: info.user })],
        role: info.role
      })
    }
  }
)

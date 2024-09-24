import { DataTable, Then, When } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { World } from '../../environment'
import { objects } from '../../../support'
import { securePassword, roleDisplayText } from '../../../support/store'

When(
  '{string} creates a public link of following resource using the sidebar panel',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })

    for (const info of stepTable.hashes()) {
      await linkObject.create({
        resource: info.resource,
        role: info.role,
        password: info.password === '%public%' ? securePassword : info.password,
        name: 'Link'
      })
    }
  }
)

When(
  '{string} creates a public link for the space with password {string} using the sidebar panel',
  async function (this: World, stepUser: string, password: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const spaceObject = new objects.applicationFiles.Spaces({ page })
    password = password === '%public%' ? securePassword : password
    await spaceObject.createPublicLink({ password })
  }
)

When(
  '{string} renames the most recently created public link of resource {string} to {string}',
  async function (this: World, stepUser: string, resource: string, newName: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    const linkName = await linkObject.changeName({ resource, newName })
    expect(linkName).toBe(newName)
  }
)

When(
  '{string} renames the most recently created public link of space to {string}',
  async function (this: World, stepUser: any, newName: any): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    const linkName = await linkObject.changeName({ newName, space: true })
    expect(linkName).toBe(newName)
  }
)

When(
  '{string} sets the expiration date of the public link named {string} of resource {string} to {string}',
  async function (
    this: World,
    stepUser: string,
    linkName: string,
    resource: string,
    expireDate: string
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    await linkObject.addExpiration({ resource, linkName, expireDate })
  }
)

When(
  '{string} changes the password of the public link named {string} of resource {string} to {string}',
  async function (
    this: World,
    stepUser: string,
    linkName: string,
    resource: string,
    newPassword: string
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    await linkObject.addPassword({ resource, linkName, newPassword })
  }
)

When(
  '{string} tries to sets a new password {string} of the public link named {string} of resource {string}',
  async function (
    this: World,
    stepUser: string,
    newPassword: string,
    linkName: string,
    resource: string
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    await linkObject.fillPassword({ resource, linkName, newPassword })
  }
)

When(
  /^"([^"]*)" (reveals|hides) the password of the public link$/,
  async function (this: World, stepUser: string, showOrHide: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    await linkObject.showOrHidePassword({ showOrHide })
  }
)

When(
  '{string} closes the public link password dialog box',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    await linkObject.clickOnCancelButton()
  }
)

When(
  '{string} copies the password of the public link',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    await linkObject.copyEnteredPassword()
  }
)

When(
  '{string} generates the password for the public link',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    await linkObject.generatePassword()
  }
)

When(
  '{string} sets the password of the public link',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    await linkObject.setPassword()
  }
)

When(
  '{string} edits the public link named {string} of resource {string} changing role to {string}',
  async function (
    this: World,
    stepUser: string,
    linkName: any,
    resource: string,
    role: string
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    const roleText = await linkObject.changeRole({ linkName, resource, role })
    expect(roleText.toLowerCase()).toBe(roleDisplayText[role].toLowerCase())
  }
)

When(
  '{string} removes the public link named {string} of resource {string}',
  async function (this: World, stepUser: string, name: string, resource: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    await linkObject.delete({ resourceName: resource, name })
  }
)

Then(
  'public link named {string} should be visible to {string}',
  async function (this: World, linkName: string, stepUser: any): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const expectedPublicLink = this.linksEnvironment.getLink({ name: linkName })
    const linkObject = new objects.applicationFiles.Link({ page })
    const actualPublicLink = await linkObject.getPublicLinkUrl({ linkName, space: true })
    expect(actualPublicLink).toBe(expectedPublicLink)
  }
)

Then(
  'public link named {string} of the resource {string} should be visible to {string}',
  async function (this: World, linkName: string, resource: string, stepUser: any): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const expectedPublicLink = this.linksEnvironment.getLink({ name: linkName })
    const linkObject = new objects.applicationFiles.Link({ page })
    const actualPublicLink = await linkObject.getPublicLinkUrl({ linkName, resource })
    expect(actualPublicLink).toBe(expectedPublicLink)
  }
)

Then(
  /^"([^"]*)" (should|should not) be able to edit the public link named "([^"]*)"$/,
  async function (
    this: World,
    stepUser: any,
    shouldOrShouldNot: string,
    linkName: any
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    const isVisible = await linkObject.islinkEditButtonVisibile(linkName)
    expect(isVisible).toBe(shouldOrShouldNot !== 'should not')
  }
)

Then(
  '{string} should see an error message',
  async function (this: World, stepUser: any, errorMessage: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    const actualErrorMessage = await linkObject.checkErrorMessage()
    expect(actualErrorMessage).toBe(errorMessage)
  }
)

When(
  '{string} edits the public link named {string} of the space changing role to {string}',
  async function (this: World, stepUser: string, linkName: string, role: any): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    const newPermission = await linkObject.changeRole({ linkName, role, space: true })
    expect(newPermission.toLowerCase()).toBe(roleDisplayText[role].toLowerCase())
  }
)

When(
  '{string} opens shared-with-me page from the internal link',
  async function (this: World, stepUser: string): Promise<void> {
    const actor = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.applicationFiles.page.shares.WithMe({ page: actor.page })
    await pageObject.openShareWithMeFromInternalLink(actor)
  }
)

When(
  '{string} copies the link {string} of resource {string}',
  async function (
    this: World,
    stepUser: string,
    linkName: string,
    resource: string
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    const clipboard = await linkObject.copyLinkToClipboard({ resource: resource, name: linkName })
    expect(clipboard).toBe(this.linksEnvironment.getLink({ name: linkName }).url)
  }
)

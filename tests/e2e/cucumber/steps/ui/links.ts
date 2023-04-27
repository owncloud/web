import { Then, When } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { World } from '../../environment'
import { objects } from '../../../support'

When(
  '{string} creates a public link for the resource {string} using the sidebar panel',
  async function (this: World, stepUser: string, resource: string) {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    await linkObject.create({
      resource,
      name: 'Link'
    })
  }
)

When(
  '{string} creates a public link for the space using the sidebar panel',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const spaceObject = new objects.applicationFiles.Spaces({ page })
    await spaceObject.createPublicLink()
  }
)

When(
  '{string} renames the most recently created public link of resource {string} to {string}',
  async function (this: World, stepUser: string, resource: string, newName: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    const linkName = await linkObject.changeName({ resource, newName })
    expect(newName).toBe(linkName)
  }
)

When(
  '{string} renames the most recently created public link of space to {string}',
  async function (this: World, stepUser: any, newName: any): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    const linkName = await linkObject.changeName({ newName, space: true })
    expect(newName).toBe(linkName)
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
  '{string} sets the password of the public link named {string} of resource {string} to {string}',
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
    expect(linkObject.roleDisplayText[role].toLowerCase()).toBe(roleText.toLowerCase())
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
    const linkObject = new objects.applicationFiles.Link({ page })
    const publicLinkUrls = await linkObject.getPublicLinkUrl({ linkName, space: true })
    expect(publicLinkUrls[0]).toBe(publicLinkUrls[1])
  }
)

Then(
  'public link named {string} of the resource {string} should be visible to {string}',
  async function (this: World, linkName: string, resource: string, stepUser: any): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    const publicLinkUrls = await linkObject.getPublicLinkUrl({ linkName, resource })
    expect(publicLinkUrls[0]).toBe(publicLinkUrls[1])
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

When(
  '{string} edits the public link named {string} of the space changing role to {string}',
  async function (this: World, stepUser: string, linkName: string, role: any): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    const newPermission = await linkObject.changeRole({ linkName, role, space: true })
    expect(linkObject.roleDisplayText[role].toLowerCase()).toBe(newPermission.toLowerCase())
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

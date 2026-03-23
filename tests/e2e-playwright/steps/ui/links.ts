import { objects } from '../../../e2e/support'
import { expect } from '@playwright/test'
import { World } from '../../support/world'
import { substitute } from '../../../e2e/support/utils'

export async function userRenamesMostRecentlyCreatedPublicLinkOfResource({
  world,
  stepUser,
  resource,
  newName
}: {
  world: World
  stepUser: string
  resource: string
  newName: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  const linkName = await linkObject.changeName({ resource, newName })
  expect(linkName).toBe(newName)
}

export async function userCopiesTheLinkOfPasswordProtectedFolder({
  world,
  stepUser,
  resource
}: {
  world: World
  stepUser: string
  resource: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  await linkObject.copyLinkToClipboard({
    resource: resource,
    resourceType: 'passwordProtectedFolder'
  })
}

export async function userClosesThePasswordProtectedFolderModal({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  await linkObject.closeFolderModal()
}

export async function userChangesRoleOfPublicLinkOfResource({
  world,
  stepUser,
  resource,
  linkName,
  newRole
}: {
  world: World
  stepUser: string
  resource: string
  linkName: string
  newRole: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  const roleText = await linkObject.changeRole({ linkName, resource, role: newRole })
  expect(roleText.toLowerCase()).toBe(newRole.toLowerCase())
}

export async function userSetsExpirationDateOfThePublicLinkOfResource({
  world,
  stepUser,
  resource,
  linkName,
  expireDate
}: {
  world: World
  stepUser: string
  resource: string
  linkName: string
  expireDate: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  await linkObject.addExpiration({ resource, linkName, expireDate })
}

export async function userRemovesThePublicLinkOfResource({
  world,
  stepUser,
  resource,
  linkName
}: {
  world: World
  stepUser: string
  resource: string
  linkName: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  await linkObject.delete({ resourceName: resource, name: linkName })
}

export async function userCreatesPublicLinkOfSpaceWithPassword({
  world,
  stepUser,
  password
}: {
  world: World
  stepUser: string
  password: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const spaceObject = new objects.applicationFiles.Spaces({ page })
  password = substitute(password)
  await spaceObject.createPublicLink({ password })
}

export async function userRenamesTheMostRecentlyCreatedPublicLinkOfSpace({
  world,
  stepUser,
  newName
}: {
  world: World
  stepUser: string
  newName: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  const linkName = await linkObject.changeName({ newName, space: true })
  expect(linkName).toBe(newName)
}

export async function userEditsThePublicLinkOfSpaceChangingRole({
  world,
  stepUser,
  linkName,
  role
}: {
  world: World
  stepUser: string
  linkName: string
  role: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  const newPermission = await linkObject.changeRole({ linkName, role, space: true })
  expect(newPermission.toLowerCase()).toBe(role.toLowerCase())
}

export async function userShouldNotBeAbleToEditThePublicLink({
  world,
  stepUser,
  linkName
}: {
  world: World
  stepUser: string
  linkName: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  const isVisible = await linkObject.islinkEditButtonVisibile(linkName)
  expect(isVisible).toBe(false)
}

export async function userChangesPasswordOfThePublicLinkOfResource({
  world,
  stepUser,
  resource,
  linkName,
  newPassword
}: {
  world: World
  stepUser: string
  resource: string
  linkName: string
  newPassword: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  await linkObject.fillPassword({ resource, linkName, newPassword })
}

export async function userShouldSeeAnErrorMessage({
  world,
  stepUser,
  errorMessage
}: {
  world: World
  stepUser: string
  errorMessage: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  const actualErrorMessage = await linkObject.checkErrorMessage()
  expect(actualErrorMessage).toBe(errorMessage)
}

export async function userClosesThePublicLinkPasswordDialogBox({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  await linkObject.clickOnCancelButton()
}

export async function userRevealsThePasswordOfThePublicLink({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  await linkObject.showOrHidePassword({ showOrHide: 'reveals' })
}

export async function userHidesThePasswordOfThePublicLink({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  await linkObject.showOrHidePassword({ showOrHide: 'hides' })
}

export async function userGeneratesThePasswordForThePublicLink({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  await linkObject.generatePassword()
}

export async function userCopiesThePasswordOfThePublicLink({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  await linkObject.copyEnteredPassword()
}

export async function userSetsThePasswordOfThePublicLink({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  await linkObject.setPassword()
}

export async function userCopiesLinkOfResource({
  world,
  stepUser,
  resource
}: {
  world: World
  stepUser: string
  resource: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  await linkObject.copyLinkToClipboard({ resource })
}
export async function userSetsExperationDateOfPublicLink({
  world,
  stepUser,
  linkName,
  resource,
  expireDate
}: {
  world: World
  stepUser: string
  linkName: string
  resource: string
  expireDate: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  await linkObject.addExpiration({ resource, linkName, expireDate })
}

export async function userChangesThePasswordOfPublicLink({
  world,
  stepUser,
  linkName,
  resource,
  newPassword
}: {
  world: World
  stepUser: string
  linkName: string
  resource: string
  newPassword: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  await linkObject.addPassword({ resource, linkName, newPassword })
}

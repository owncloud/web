import { DataTable, Then, When } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { World } from '../../environment'
import { objects } from '../../../support'
import { ICollaborator } from '../../../support/objects/app-files/share/collaborator'

const parseShareTable = function (stepTable: DataTable, usersEnvironment) {
  return stepTable.hashes().reduce((acc, stepRow) => {
    const { resource, recipient, type, role, resourceType, expirationDate } = stepRow

    if (!acc[resource]) {
      acc[resource] = []
    }

    acc[resource].push({
      collaborator:
        type === 'group'
          ? usersEnvironment.getGroup({ key: recipient })
          : usersEnvironment.getUser({ key: recipient }),
      role,
      type,
      resourceType,
      expirationDate
    })

    return acc
  }, [])
}

When(
  /^"([^"]*)" shares the following resource(?:s)? using the (sidebar panel|quick action|direct url navigation)$/,
  async function (this: World, stepUser: string, actionType: string, stepTable: DataTable) {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const shareObject = new objects.applicationFiles.Share({ page })
    const shareInfo = parseShareTable(stepTable, this.usersEnvironment)

    for (const resource of Object.keys(shareInfo)) {
      await shareObject.create({
        resource,
        recipients: shareInfo[resource],
        via:
          actionType === 'quick action'
            ? 'QUICK_ACTION'
            : 'sidebar panel'
              ? 'SIDEBAR_PANEL'
              : 'URL_NAVIGATION'
      })
    }
  }
)

When(
  '{string} accepts the following share(s)',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const shareObject = new objects.applicationFiles.Share({ page })

    for (const info of stepTable.hashes()) {
      await shareObject.accept({ resource: info.name })
    }
  }
)

When(
  '{string} updates following sharee role(s)',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const shareObject = new objects.applicationFiles.Share({ page })
    const shareInfo = parseShareTable(stepTable, this.usersEnvironment)

    for (const resource of Object.keys(shareInfo)) {
      await shareObject.changeShareeRole({
        resource,
        recipients: shareInfo[resource]
      })
    }
  }
)

When(
  '{string} removes following sharee(s)',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const shareObject = new objects.applicationFiles.Share({ page })
    const shareInfo = parseShareTable(stepTable, this.usersEnvironment)

    for (const resource of Object.keys(shareInfo)) {
      await shareObject.removeSharee({ resource, recipients: shareInfo[resource] })
    }
  }
)

Then(
  '{string} should see the following recipient(s)',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const shareObject = new objects.applicationFiles.Share({ page })
    const shareInfo = parseShareTable(stepTable, this.usersEnvironment)

    for (const resource of Object.keys(shareInfo)) {
      await shareObject.checkSharee({ resource, recipients: shareInfo[resource] })
    }
  }
)

Then(
  /"([^"]*)" (should|should not) be able to reshare the following resource(?:s)?$/,
  async function (this: World, stepUser: string, condition: string, stepTable: DataTable) {
    const ableToShare = condition === 'should'
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const shareObject = new objects.applicationFiles.Share({ page })

    for (const { resource } of stepTable.hashes()) {
      const hasSharePermission = await shareObject.hasPermissionToShare(resource)
      expect(hasSharePermission).toBe(ableToShare)
    }
  }
)

When(
  '{string} navigates to the shared with me page',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.applicationFiles.page.shares.WithMe({ page })
    await pageObject.navigate()
  }
)

When(
  '{string} navigates to the shared with others page',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.applicationFiles.page.shares.WithOthers({ page })
    await pageObject.navigate()
  }
)

When(
  '{string} declines the following share(s)',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const shareObject = new objects.applicationFiles.Share({ page })

    for (const resource of stepTable.hashes()) {
      await shareObject.declineShare({ resource: resource.name })
    }
  }
)

When(
  '{string} accepts the following share(s) from the context menu',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const shareObject = new objects.applicationFiles.Share({ page })

    for (const resource of stepTable.hashes()) {
      await shareObject.accept({ resource: resource.name, via: 'CONTEXT_MENU' })
    }
  }
)

When(
  '{string} accepts all pending shares using the batch actions',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const shareObject = new objects.applicationFiles.Share({ page })
    await shareObject.acceptAll()
  }
)

When(
  '{string} declines the following share from the context menu',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const shareObject = new objects.applicationFiles.Share({ page })

    for (const resource of stepTable.hashes()) {
      await shareObject.declineShare({ resource: resource.name, via: 'CONTEXT_MENU' })
    }
  }
)

When(
  '{string} creates quick link of the resource {string} with password {string} from the context menu',
  async function (
    this: World,
    stepUser: string,
    resource: string,
    password: string
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const shareObject = new objects.applicationFiles.Share({ page })
    const linkObject = new objects.applicationFiles.Link({ page })
    password = password === '%public%' ? linkObject.securePassword : password
    await shareObject.createQuickLink({
      resource,
      password
    })
  }
)

When(
  '{string} should not be able to open the folder/file {string}',
  async function (this: World, stepUser: string, resource: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const shareObject = new objects.applicationFiles.Share({ page })
    expect(await shareObject.resourceIsNotOpenable(resource)).toBe(true)
  }
)

When(
  /"([^"]*)" (should|should not) see a sync status for the (folder|file) "([^"]*)"?$/,
  async function (
    this: World,
    stepUser: string,
    condition: string,
    _: string,
    resource: string
  ): Promise<void> {
    const shouldSee = condition === 'should'
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const shareObject = new objects.applicationFiles.Share({ page })
    expect(await shareObject.resourceIsSynced(resource)).toBe(shouldSee)
  }
)

Then(
  /"([^"]*)" (should|should not) be able to see the following shares$/,
  async function (
    this: World,
    stepUser: string,
    condition: string,
    stepTable: DataTable
  ): Promise<void> {
    const shouldExist = condition === 'should'
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const shareObject = new objects.applicationFiles.Share({ page })
    for (const { resource, owner } of stepTable.hashes()) {
      const isAcceptedSharePresent = await shareObject.isAcceptedSharePresent(resource, owner)
      expect(isAcceptedSharePresent, '${resource} does not exist in accepted share').toBe(
        shouldExist
      )
    }
  }
)

When(
  /^"([^"]*)" (grants|denies) access to the following resources(s)? for (group|user) "([^"]*)" using the sidebar panel?$/,
  async function (
    this: World,
    stepUser: string,
    actionType: string,
    _: unknown,
    collaboratorType: 'user' | 'group',
    collaborator: string,
    stepTable: DataTable
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const shareObject = new objects.applicationFiles.Share({ page })

    for (const { resource } of stepTable.hashes()) {
      await shareObject.setDenyShare({
        resource,
        deny: actionType === 'denies',
        collaborator: {
          collaborator:
            collaboratorType === 'group'
              ? this.usersEnvironment.getGroup({ key: collaborator })
              : this.usersEnvironment.getUser({ key: collaborator }),
          type: collaboratorType
        } as ICollaborator
      })
    }
  }
)

When(
  /^"([^"]*)" sets the expiration date of share "([^"]*)" of (group|user) "([^"]*)" to "([^"]*)"?$/,
  async function (
    this: World,
    stepUser: string,
    resource: string,
    collaboratorType: 'user' | 'group',
    collaboratorName: string,
    expirationDate: string
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const shareObject = new objects.applicationFiles.Share({ page })
    await shareObject.addExpirationDate({
      resource,
      collaborator: {
        collaborator:
          collaboratorType === 'group'
            ? this.usersEnvironment.getGroup({ key: collaboratorName })
            : this.usersEnvironment.getUser({ key: collaboratorName }),
        type: collaboratorType
      } as ICollaborator,
      expirationDate
    })
  }
)

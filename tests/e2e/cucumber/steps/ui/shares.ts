import { DataTable, Then, When } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { World } from '../../environment'
import { environment, objects } from '../../../support'
import {
  CollaboratorType,
  ICollaborator
} from '../../../support/objects/app-files/share/collaborator'
import { ActionViaType } from '../../../support/objects/app-files/share/actions'

const parseShareTable = function (
  stepTable: DataTable,
  usersEnvironment: environment.UsersEnvironment
) {
  return stepTable.hashes().reduce<Record<string, ICollaborator[]>>((acc, stepRow) => {
    const { resource, recipient, type, role, resourceType, expirationDate, shareType } = stepRow

    if (!acc[resource]) {
      acc[resource] = []
    }

    acc[resource].push({
      collaborator:
        type === 'group'
          ? usersEnvironment.getGroup({ key: recipient })
          : usersEnvironment.getUser({ key: recipient }),
      role,
      type: type as CollaboratorType,
      resourceType,
      expirationDate,
      shareType
    })

    return acc
  }, {})
}

When(
  /^"([^"]*)" shares the following resource(?:s)? using the (sidebar panel|quick action|direct url navigation)$/,
  async function (this: World, stepUser: string, actionType: string, stepTable: DataTable) {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const shareObject = new objects.applicationFiles.Share({ page })
    const shareInfo = parseShareTable(stepTable, this.usersEnvironment)

    let via: ActionViaType
    switch (actionType) {
      case 'quick action':
        via = 'QUICK_ACTION'
        break
      case 'sidebar panel':
        via = 'SIDEBAR_PANEL'
        break
      case 'direct url navigation':
        via = 'URL_NAVIGATION'
        break
      default:
        throw new Error(`Unknown action type: ${actionType}`)
    }

    for (const resource of Object.keys(shareInfo)) {
      await shareObject.create({
        resource,
        recipients: shareInfo[resource],
        via
      })
    }
  }
)

When(
  '{string} enables the sync for the following share(s)',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const shareObject = new objects.applicationFiles.Share({ page })

    for (const info of stepTable.hashes()) {
      await shareObject.enableSync({ resource: info.name })
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
  '{string} navigates to the shared via link page',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.applicationFiles.page.shares.ViaLink({ page })
    await pageObject.navigate()
  }
)

When(
  '{string} disables the sync for the following share(s)',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const shareObject = new objects.applicationFiles.Share({ page })

    for (const resource of stepTable.hashes()) {
      await shareObject.disableSync({ resource: resource.name })
    }
  }
)

When(
  '{string} enables the sync for the following share(s) using the context menu',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const shareObject = new objects.applicationFiles.Share({ page })

    for (const resource of stepTable.hashes()) {
      await shareObject.enableSync({ resource: resource.name, via: 'CONTEXT_MENU' })
    }
  }
)

When(
  '{string} enables the sync for all shares using the batch actions',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const shareObject = new objects.applicationFiles.Share({ page })
    await shareObject.syncAll()
  }
)

When(
  '{string} disables the sync for the following share(s) using the context menu',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const shareObject = new objects.applicationFiles.Share({ page })

    for (const resource of stepTable.hashes()) {
      await shareObject.disableSync({ resource: resource.name, via: 'CONTEXT_MENU' })
    }
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
  /"([^"]*)" (should|should not) see a sync status for the (?:folder|file) "([^"]*)"?$/,
  async function (
    this: World,
    stepUser: string,
    condition: string,
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
  /^"([^"]*)" (grants|denies) access to the following resources(?:s)? for (group|user) "([^"]*)" using the sidebar panel?$/,
  async function (
    this: World,
    stepUser: string,
    actionType: string,
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

When(
  /^"([^"]*)" checks the following access details of share "([^"]*)" for (user|group) "([^"]*)"$/,
  async function (
    this: World,
    stepUser: string,
    resource: string,
    collaboratorType: string,
    collaboratorName: string,
    stepTable: DataTable
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const shareObject = new objects.applicationFiles.Share({ page })
    const expectedDetails = stepTable.rowsHash()
    const actualDetails = await shareObject.getAccessDetails({
      resource,
      collaborator: {
        collaborator:
          collaboratorType === 'group'
            ? this.usersEnvironment.getGroup({ key: collaboratorName })
            : this.usersEnvironment.getUser({ key: collaboratorName }),
        type: collaboratorType
      } as ICollaborator
    })

    expect(actualDetails).toMatchObject(expectedDetails)
  }
)

Then(
  '{string} should see the message {string} on the webUI',
  async function (this: World, stepUser: string, message: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const shareObject = new objects.applicationFiles.Share({ page })
    const actualMessage = await shareObject.getMessage()
    expect(actualMessage).toBe(message)
  }
)

Then(
  /^"([^"]*)" (should|should not) be able to manage share of a file "([^"]*)" for user "([^"]*)"$/,
  async function (
    this: World,
    stepUser: any,
    actionType: string,
    resource: string,
    recipient: string
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const shareObject = new objects.applicationFiles.Share({ page })
    const changeRole = shareObject.changeRoleLocator(
      this.usersEnvironment.getUser({ key: recipient })
    )
    const changeShare = shareObject.changeShareLocator(
      this.usersEnvironment.getUser({ key: recipient })
    )

    await shareObject.openSharingPanel(resource)

    if (actionType === 'should') {
      await expect(changeRole).not.toBeDisabled()
      await expect(changeShare).not.toBeDisabled()
    } else {
      await expect(changeRole).toBeDisabled()
      await expect(changeShare).toBeDisabled()
    }
  }
)

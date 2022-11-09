import { DataTable, Then, When } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { World } from '../../environment'
import { objects } from '../../../support'

const parseShareTable = function (stepTable: DataTable, usersEnvironment) {
  return stepTable.hashes().reduce((acc, stepRow) => {
    const { resource, recipient, type, role } = stepRow

    if (!acc[resource]) {
      acc[resource] = []
    }

    acc[resource].push({
      collaborator:
        type === 'group'
          ? usersEnvironment.getGroup({ key: recipient })
          : usersEnvironment.getUser({ key: recipient }),
      role,
      type
    })

    return acc
  }, {})
}

When(
  /^"([^"]*)" shares the following (resource|resources) using the (sidebar panel|quick action)$/,
  async function (
    this: World,
    stepUser: string,
    _: string,
    actionType: string,
    stepTable: DataTable
  ) {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const shareObject = new objects.applicationFiles.Share({ page })
    const shareInfo = parseShareTable(stepTable, this.usersEnvironment)

    for (const resource of Object.keys(shareInfo)) {
      await shareObject.create({
        resource,
        recipients: shareInfo[resource],
        via: actionType === 'quick action' ? 'QUICK_ACTION' : 'SIDEBAR_PANEL'
      })
    }
  }
)

When(
  /^"([^"]*)" reshares the following (resource|resources)$/,
  async function (this: World, stepUser: string, _: string, stepTable: DataTable) {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const shareObject = new objects.applicationFiles.Share({ page })
    const shareInfo = parseShareTable(stepTable, this.usersEnvironment)

    for (const resource of Object.keys(shareInfo)) {
      await shareObject.create({
        resource,
        recipients: shareInfo[resource]
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
  /"([^"]*)" should( not | )be able to reshare the following resource(s)?$/,
  async function (
    this: World,
    stepUser: string,
    condition: string,
    _: string,
    stepTable: DataTable
  ) {
    const ableToShare = condition.trim() !== 'not'
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const shareObject = new objects.applicationFiles.Share({ page })

    for (const { resource } of stepTable.hashes()) {
      const hasSharePermission = await shareObject.hasPermissionToShare(resource)
      expect(hasSharePermission).toBe(ableToShare)
    }
  }
)

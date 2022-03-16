import { DataTable, When } from '@cucumber/cucumber'
import { World } from '../../environment'
import { objects } from '../../../support'

When(
  /^"([^"]*)" shares the following (resource|resources) using the (sidebar panel|quick action)$/,
  async function (
    this: World,
    stepUser: string,
    _: string,
    actionType: string,
    stepTable: DataTable
  ) {
    const { page } = this.actorsEnvironment.getActor({ id: stepUser })
    const shareObject = new objects.applicationFiles.Share({ page })
    const shareInfo = stepTable.hashes().reduce((acc, stepRow) => {
      const { user, resource, role } = stepRow

      if (!acc[resource]) {
        acc[resource] = { users: [], role: '' }
      }

      acc[resource].users.push(this.usersEnvironment.getUser({ id: user }))
      acc[resource].role = role

      return acc
    }, {})

    for (const folder of Object.keys(shareInfo)) {
      await shareObject.create({
        folder,
        users: shareInfo[folder].users,
        role: shareInfo[folder].role,
        via: actionType === 'quick action' ? 'QUICK_ACTION' : 'SIDEBAR_PANEL'
      })
    }
  }
)

When(
  '{string} accepts the following share(s)',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const { page } = this.actorsEnvironment.getActor({ id: stepUser })
    const shareObject = new objects.applicationFiles.Share({ page })

    for (const info of stepTable.hashes()) {
      await shareObject.accept({ name: info.name })
    }
  }
)

When(
  '{string} updates following sharee role(s)',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const { page } = this.actorsEnvironment.getActor({ id: stepUser })
    const shareObject = new objects.applicationFiles.Share({ page })
    const shareInfo = stepTable.hashes().reduce((acc, stepRow) => {
      const { user, resource, role } = stepRow

      if (!acc[resource]) {
        acc[resource] = { users: [], role: '' }
      }

      acc[resource].users.push(this.usersEnvironment.getUser({ id: user }))
      acc[resource].role = role

      return acc
    }, {})

    for (const folder of Object.keys(shareInfo)) {
      await shareObject.changeShareeRole({
        folder,
        users: shareInfo[folder].users,
        role: shareInfo[folder].role
      })
    }
  }
)

When(
  '{string} removes following sharee(s)',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const { page } = this.actorsEnvironment.getActor({ id: stepUser })
    const shareObject = new objects.applicationFiles.Share({ page })
    const shareInfo = stepTable.hashes().reduce((acc, stepRow) => {
      const { user, resource } = stepRow

      acc[resource] = []

      acc[resource].push(this.usersEnvironment.getUser({ id: user }))

      return acc
    }, {})

    for (const folder of Object.keys(shareInfo)) {
      await shareObject.removeSharee({ folder, users: shareInfo[folder] })
    }
  }
)

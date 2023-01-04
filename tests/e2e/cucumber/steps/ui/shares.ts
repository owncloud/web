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
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const shareObject = new objects.applicationFiles.Share({ page })
    const shareInfo = stepTable.hashes().reduce((acc, stepRow) => {
      const { resource, recipient, type, role } = stepRow

      if (!acc[resource]) {
        acc[resource] = { recipients: [], role: '', type: '' }
      }

      acc[resource].recipients.push(
        type === 'group'
          ? this.usersEnvironment.getGroup({ key: recipient })
          : this.usersEnvironment.getUser({ key: recipient })
      )
      acc[resource].role = role

      return acc
    }, {})

    for (const folder of Object.keys(shareInfo)) {
      await shareObject.create({
        folder,
        recipients: shareInfo[folder].recipients,
        role: shareInfo[folder].role,
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
    const shareInfo = stepTable.hashes().reduce((acc, stepRow) => {
      const { recipient, type, resource, role } = stepRow

      if (!acc[resource]) {
        acc[resource] = { recipients: [], role: '', type: '' }
      }

      acc[resource].recipients.push(
        type === 'group'
          ? this.usersEnvironment.getGroup({ key: recipient })
          : this.usersEnvironment.getUser({ key: recipient })
      )
      acc[resource].role = role

      return acc
    }, {})

    for (const folder of Object.keys(shareInfo)) {
      await shareObject.createReshare({
        folder,
        recipients: shareInfo[folder].recipients,
        role: shareInfo[folder].role
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
      await shareObject.accept({ name: info.name })
    }
  }
)

When(
  '{string} updates following sharee role(s)',
  async function (this: World, stepUser: string, stepTable: DataTable) {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const shareObject = new objects.applicationFiles.Share({ page })
    const shareInfo = stepTable.hashes().reduce((acc, stepRow) => {
      const { user, resource, role } = stepRow

      if (!acc[resource]) {
        acc[resource] = { users: [], role: '' }
      }

      acc[resource].users.push(this.usersEnvironment.getUser({ key: user }))
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
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const shareObject = new objects.applicationFiles.Share({ page })
    const shareInfo = stepTable.hashes().reduce((acc, stepRow) => {
      const { user, resource } = stepRow

      acc[resource] = []

      acc[resource].push(this.usersEnvironment.getUser({ key: user }))

      return acc
    }, {})

    for (const folder of Object.keys(shareInfo)) {
      await shareObject.removeSharee({ folder, users: shareInfo[folder] })
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

When('{string} declines the following share(s)', async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const {page} = this.actorsEnvironment.getActor({key: stepUser})
    const shareObject = new objects.applicationFiles.Share({page})

    for (const resource of stepTable.hashes()) {
        await shareObject.declineShare({resource: resource.name})
    }
});

When('{string} accepts the following share(s) using the quick action', async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const {page} = this.actorsEnvironment.getActor({key: stepUser})
    const shareObject = new objects.applicationFiles.Share({page})
    for (const resource of stepTable.hashes()) {
        await shareObject.accept({resource: resource.name, via: 'ACTIONS'})
    }
});

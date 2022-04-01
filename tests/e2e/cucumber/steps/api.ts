import { Given, DataTable } from '@cucumber/cucumber'
import { World } from '../environment'
import { config } from '../../config'
import { api } from '../../support'

Given(
  '{string} creates following users',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const admin = this.usersEnvironment.getUser({ key: stepUser })

    for (const info of stepTable.hashes()) {
      const user = this.usersEnvironment.getUser({ key: info.id })
      await api.user.deleteUser({ user, admin })
      await api.user.createUser({ user, admin })
    }
  }
)

Given(
  '{string} assigns following roles to the users',
  async function (this: World, stepUser: string, stepTable: DataTable): Promise<void> {
    const admin = this.usersEnvironment.getUser({ key: stepUser })
    for await (const info of stepTable.hashes()) {
      const user = this.usersEnvironment.getUser({ key: info.id })
      const { id } = await api.graph.me({ user })
      const role = api.settings.Roles[info.role]

      if (!role) {
        throw new Error(`unknown role "${info.role}"`)
      }

      await api.settings.assignRole({ admin, id, role })
    }
  }
)

Given(
  '{string} sets the default folder for received shares to {string}',
  async function (this: World, stepUser: string, value: string): Promise<void> {
    const user = this.usersEnvironment.getUser({ key: stepUser })

    if (!config.ocis) {
      await api.config.setShareFolder({ value, user })
    }
  }
)

Given(
  /^"([^"]*)" (disables|enables) share auto accepting$/,
  async function (this: World, stepUser: string, actionType: string): Promise<void> {
    if (config.ocis) {
      return
    }

    const user = this.usersEnvironment.getUser({ key: stepUser })

    await api.config.disableShareAutoAccept({
      user,
      action: actionType === 'disables' ? 'disable' : 'enable'
    })
  }
)

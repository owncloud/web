import { Given, DataTable } from '@cucumber/cucumber'
import { World, api, config } from '../../support'

Given(
  'following users have been created',
  async function (this: World, stepUsers: DataTable): Promise<void> {
    const users = stepUsers.raw().map((u) => this.userContinent.get({ id: u[0] }))
    const admin = this.userContinent.get({ id: 'admin' })

    for (const user of users) {
      await api.user.deleteUser({ user, admin })
      await api.user.createUser({ user, admin })
    }
  }
)

Given(
  'admin set the default folder for received shares to {string}',
  async function (this: World, value: string): Promise<void> {
    const user = this.userContinent.get({ id: 'admin' })

<<<<<<< HEAD
    if (!config.ocis) {
      await api.config.setShareFolder({ value, user })
    }
=======
Given('admin disables auto accepting', async function(this: World): Promise<void> {
  const admin = this.userContinent.get({ id: 'admin' })
  if (!config.ocis) {
    await api.folder.disablesAutoAccept({ admin })
>>>>>>> 1dd54fe5 (add checking version)
  }
)

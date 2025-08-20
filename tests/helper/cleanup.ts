import { config } from '../e2e/config.js'
import { api, environment, store } from '../e2e/support'
import { User, UserState } from '../e2e/support/types'

const cleanupPredefinedUser = async (userKey: string, user: User) => {
  // delete the personal space resources
  const resources = await api.dav.listSpaceResources({ user, spaceType: 'personal' })
  for (const fileId in resources) {
    await api.dav.deleteSpaceResource({ user, fileId })
  }

  // cleanup trashbin if resources have been deleted
  if (Object.keys(resources).length) {
    await api.dav.emptyTrashbin({ user, spaceType: 'personal' })
  }

  // revert user state
  const usersEnvironment = new environment.UsersEnvironment()
  const userState: UserState = usersEnvironment.getUserState(userKey)
  if (userState.hasOwnProperty('autoAcceptShare')) {
    await api.settings.configureAutoAcceptShare({ user, state: userState.autoAcceptShare })
  }
  if (userState.hasOwnProperty('language')) {
    await api.settings.changeLanguage({ user, language: userState.language })
  }
}

export const cleanUpUser = async (createdUserStore, adminUser: User) => {
  const requests: Promise<User>[] = []
  for (const [key, user] of createdUserStore.entries()) {
    console.log(`Cleanup user: ${user.id}`)
    if (!config.predefinedUsers) {
      requests.push(api.provision.deleteUser({ user, admin: adminUser }))
    } else {
      await cleanupPredefinedUser(key, user)
    }
  }
  await Promise.all(requests)
  createdUserStore.clear()
  store.keycloakCreatedUser.clear()
}

import { test as base } from '@playwright/test'
import { UsersEnvironment } from '../../e2e/support/environment'
import { Group, User, UserState } from '../../e2e/support/types'
import { config } from '../../e2e/config.js'
import { api, store, environment, utils } from '../../e2e/support'

const usersEnvironment = new UsersEnvironment()

export const test = base.extend<{ usersEnvironment: UsersEnvironment }>({
  usersEnvironment: async ({}, use) => {
    await use(usersEnvironment)
  }
})

test.afterEach(async ({ usersEnvironment }) => {
  config.federatedServer = false
  const adminUser = usersEnvironment.getUser({ key: config.adminUsername })
  if (!config.predefinedUsers) {
    // refresh keycloak admin access token
    if (config.keycloak) {
      const keycloakAdminUser = usersEnvironment.getUser({ key: config.keycloakAdminUser })
      await api.keycloak.refreshAccessTokenForKeycloakUser(keycloakAdminUser)
      await api.keycloak.refreshAccessTokenForKeycloakOcisUser(keycloakAdminUser)
    } else {
      await api.token.refreshAccessToken(adminUser)
    }

    // FIXME: ocm tests
    // if (isOcm(pickle)) {
    //   // need to set federatedServer config to true to delete federated oCIS users
    //   config.federatedServer = true
    //   await api.token.refreshAccessToken(adminUser)
    //   await cleanUpUser(store.federatedUserStore, adminUser)
    //   config.federatedServer = false
    // }
  }

  await cleanUpUser(store.createdUserStore, adminUser)
  await cleanUpGroup(adminUser)
  await cleanUpSpaces(adminUser)

  store.createdLinkStore.clear()
  store.createdTokenStore.clear()
  store.federatedTokenStore.clear()
  store.keycloakTokenStore.clear()

  utils.removeTempUploadDirectory()
  environment.closeSSEConnections()
})

const cleanUpUser = async (createdUserStore, adminUser: User) => {
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

const cleanUpGroup = async (adminUser: User) => {
  console.log('groups:', store.createdGroupStore.keys())
  if (config.predefinedUsers) {
    return
  }
  const requests: Promise<Group>[] = []
  store.createdGroupStore.forEach((group) => {
    if (!group.id.startsWith('keycloak')) {
      console.log(`Cleanup group: ${group.displayName}`)
      requests.push(api.graph.deleteGroup({ group, admin: adminUser }))
    }
  })

  await Promise.all(requests)
  store.createdGroupStore.clear()
}

const cleanUpSpaces = async (adminUser: User) => {
  if (config.predefinedUsers) {
    return
  }
  const requests: Promise<void>[] = []
  store.createdSpaceStore.forEach((space) => {
    console.log(`Cleanup space: ${space.name}`)
    requests.push(
      api.graph
        .disableSpace({
          user: adminUser,
          space
        })
        .then(async (res) => {
          if (res.status === 204) {
            await api.graph.deleteSpace({
              user: adminUser,
              space
            })
          }
        })
    )
  })
  await Promise.all(requests)
  store.createdSpaceStore.clear()
}

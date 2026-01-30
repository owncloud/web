import { test as base } from '@playwright/test'
import { UsersEnvironment } from '../../e2e/support/environment'
import { User, UserState } from '../../e2e/support/types'
import { config } from '../../e2e/config.js'
import { api, store, environment, utils } from '../../e2e/support'
import { request } from '../../e2e/support/api/http'
import { join } from 'path'

const usersEnvironment = new UsersEnvironment()
const spacesEnvironment = new environment.SpacesEnvironment()

export const test = base.extend<{
  usersEnvironment: UsersEnvironment
  spacesEnvironment: environment.SpacesEnvironment
  globalCleanup: void
}>({
  usersEnvironment: async ({}, use) => {
    await use(usersEnvironment)
  },
  spacesEnvironment: async ({}, use) => {
    await use(spacesEnvironment)
  },
  globalCleanup: [
    async ({ usersEnvironment }, use) => {
      await use()

      console.log('HIIIIII')
      config.federatedServer = false
      const adminUser = usersEnvironment.getUser({ key: config.adminUsername })

      if (!config.predefinedUsers && adminUser) {
        try {
          if (config.keycloak) {
            const keycloakAdminUser = usersEnvironment.getUser({ key: config.keycloakAdminUser })
            await api.keycloak.refreshAccessTokenForKeycloakUser(keycloakAdminUser)
            await api.keycloak.refreshAccessTokenForKeycloakOcisUser(keycloakAdminUser)
          } else {
            await api.token.refreshAccessToken(adminUser)
          }
        } catch (error) {
          console.warn('Error refreshing token:', error)
        }
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
    },
    { auto: true }
  ]
})

const cleanUpUser = async (createdUserStore, adminUser: User) => {
  if (!adminUser) {
    return
  }

  const requests: Promise<User>[] = []
  for (const [key, user] of createdUserStore.entries()) {
    if (!config.predefinedUsers) {
      requests.push(api.provision.deleteUser({ user, admin: adminUser }))
    } else {
      await cleanupPredefinedUser(key, user)
    }
  }

  const results = await Promise.allSettled(requests)
  const failures = results.filter((r) => r.status === 'rejected')
  if (failures.length > 0) {
    throw new Error(
      `Failed to cleanup users: ${failures.map((f: any) => f.reason?.message || f.reason).join(', ')}`
    )
  }

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
  if (config.predefinedUsers || !adminUser) {
    return
  }

  // Get all groups from the server
  const serverGroups = await api.graph.getGroups(adminUser)

  // Delete groups by their UUID (which stays the same even when renamed)
  for (const [key, group] of store.createdGroupStore.entries()) {
    const serverGroup = serverGroups.find((g) => g.id === group.uuid)
    if (serverGroup) {
      await request({
        method: 'DELETE',
        path: join('graph', 'v1.0', 'groups', serverGroup.id),
        user: adminUser
      })
    }
  }

  // Clear the local store
  store.createdGroupStore.clear()
}

const cleanUpSpaces = async (adminUser: User) => {
  if (config.predefinedUsers) {
    return
  }
  const requests: Promise<void>[] = []
  store.createdSpaceStore.forEach((space) => {
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
  const results = await Promise.allSettled(requests)
  const failures = results.filter((r) => r.status === 'rejected')
  if (failures.length > 0) {
    console.error(
      `Failed to cleanup ${failures.length} spaces:`,
      failures.map((f: any) => f.reason?.message || f.reason)
    )
    throw new Error(
      `Space cleanup failed: ${failures.map((f: any) => f.reason?.message || f.reason).join(', ')}`
    )
  }
  store.createdSpaceStore.clear()
}

import { test as base } from '@playwright/test'
import { User, UserState, Group } from '../../e2e/support/types'
import { config } from '../../e2e/config.js'
import { api, store, environment, utils } from '../../e2e/support'
import { World } from './world'
import { state } from '../../e2e/cucumber/environment/shared'
import { getBrowserLaunchOptions } from '../../e2e/support/environment/actor/shared'
import { Browser, chromium, firefox, webkit } from '@playwright/test'

export const test = base.extend<{
  world: World
  globalCleanup: void
  globalBeforeHook: void
}>({
  world: async ({}, use) => {
    const world = new World()
    await use(world)
  },
  globalCleanup: [
    async ({ world }: { world: World }, use, testInfo) => {
      await use()

      config.federatedServer = false
      await world.actorsEnvironment.close()
      const adminUser = world.usersEnvironment.getUser({ key: config.adminUsername })

      if (!config.predefinedUsers && adminUser) {
        if (config.keycloak) {
          const keycloakAdminUser = world.usersEnvironment.getUser({
            key: config.keycloakAdminUser
          })
          await api.keycloak.refreshAccessTokenForKeycloakUser(keycloakAdminUser)
          await api.keycloak.refreshAccessTokenForKeycloakOcisUser(keycloakAdminUser)
        } else {
          await api.token.refreshAccessToken(adminUser)
        }

        if (isOcm(testInfo)) {
          // need to set federatedServer config to true to delete federated oCIS users
          config.federatedServer = true
          await api.token.refreshAccessToken(adminUser)
          await cleanUpUser(
            store.federatedUserStore,
            world.usersEnvironment.getUser({ key: config.adminUsername })
          )
          config.federatedServer = false
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
  ],
  globalBeforeHook: [
    async ({ world }: { world: World }, use, testInfo) => {
      if (!config.basicAuth && !config.predefinedUsers) {
        // let user = world.usersEnvironment.getUser({ key: config.keycloakAdminUser })
        let user = world.usersEnvironment.getUser({ key: config.adminUsername })
        if (config.keycloak) {
          user = world.usersEnvironment.getUser({ key: config.keycloakAdminUser })
          await api.keycloak.setAccessTokenForKeycloakOcisUser(user)
          await api.keycloak.setAccessTokenForKeycloakUser(user)
          await storeKeycloakGroups(user, world.usersEnvironment)
        } else {
          await api.token.setAccessAndRefreshToken(user)
          if (isOcm(testInfo)) {
            config.federatedServer = true
            await api.token.setAccessAndRefreshToken(user)
            config.federatedServer = false
          }
        }
      }
      await use()
    },
    { auto: true }
  ]
})

test.beforeAll(async () => {
  const browserConfiguration = getBrowserLaunchOptions()
  const browsers: Record<string, () => Promise<Browser>> = {
    firefox: async () => await firefox.launch(browserConfiguration),
    webkit: async () => await webkit.launch(browserConfiguration),
    chrome: async () => await chromium.launch({ ...browserConfiguration, channel: 'chrome' }),
    chromium: async () => await chromium.launch(browserConfiguration)
  }
  state.browser = await browsers[config.browser]()

  if (config.keycloak) {
    const usersEnvironment = new environment.UsersEnvironment()
    api.keycloak.setupKeycloakAdminUser(usersEnvironment.getUser({ key: config.keycloakAdminUser }))
  }
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
      `Failed to clean up users: ${failures.map((f: any) => f.reason?.message || f.reason).join(', ')}`
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
  const requests: Promise<Group>[] = []
  store.createdGroupStore.forEach((group) => {
    if (!group.id.startsWith('keycloak')) {
      requests.push(api.graph.deleteGroup({ group, admin: adminUser }))
    }
  })

  const results = await Promise.allSettled(requests)
  const failures = results.filter((r) => r.status === 'rejected')
  if (failures.length > 0) {
    throw new Error(
      `Failed to clean up groups: ${failures.map((f: any) => f.reason?.message || f.reason).join(', ')}`
    )
  }
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
    throw new Error(
      `Space clean up failed: ${failures.map((f: any) => f.reason?.message || f.reason).join(', ')}`
    )
  }
  store.createdSpaceStore.clear()
}

const isOcm = (testInfo): boolean => {
  return testInfo.tags.includes('@ocm')
}

const storeKeycloakGroups = async (adminUser: User, usersEnvironment) => {
  const groups = await api.graph.getGroups(adminUser)

  store.dummyKeycloakGroupStore.forEach((dummyGroup) => {
    const matchingGroup = groups.find((group) => group.displayName === dummyGroup.displayName)
    if (matchingGroup) {
      usersEnvironment.storeCreatedGroup({ group: { ...dummyGroup, uuid: matchingGroup.id } })
    }
  })
}

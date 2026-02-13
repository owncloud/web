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
}>({
  usersEnvironment: async ({}, use) => {
    await use(usersEnvironment)
  },
  spacesEnvironment: async ({}, use) => {
    await use(spacesEnvironment)
  }
})

test.afterEach(async ({ usersEnvironment }) => {
  config.federatedServer = false
  const adminUser = usersEnvironment.getUser({ key: config.adminUsername })

  if (!config.predefinedUsers && adminUser) {
    // refresh keycloak admin access token
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
  console.log(
    '[AFTER-EACH] Store entries AFTER cleanUpUser:',
    Array.from(store.createdGroupStore.entries())
  )
  await cleanUpOrphanedGroups(adminUser)
  console.log(
    '[AFTER-EACH] Store entries AFTER cleanUpOrphanedGroups:',
    Array.from(store.createdGroupStore.entries())
  )
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

const cleanUpOrphanedGroups = async (adminUser: User) => {
  if (config.predefinedUsers || !adminUser) {
    return
  }

  console.log('[CLEANUP] Starting orphaned group cleanup...')
  console.log(
    '[CLEANUP] Store entries BEFORE orphaned cleanup:',
    Array.from(store.createdGroupStore.entries())
  )

  // Delete orphaned groups that might have been left from failed test runs
  const serverGroups = await api.graph.getGroups(adminUser)
  console.log(
    '[CLEANUP] Server groups found:',
    serverGroups.map((g) => g.displayName)
  )

  const knownTestGroupNames = [
    'a renamed group',
    'sales department',
    'security department',
    'finance department'
  ]

  const deletePromises: Promise<void>[] = []
  for (const groupName of knownTestGroupNames) {
    const orphanedGroup = serverGroups.find((g) => g.displayName === groupName)
    if (orphanedGroup) {
      console.log('[CLEANUP] Found orphaned group to delete:', groupName, orphanedGroup.id)
      deletePromises.push(
        (async () => {
          const response = await request({
            method: 'DELETE',
            path: join('graph', 'v1.0', 'groups', orphanedGroup.id),
            user: adminUser
          })

          console.log('[CLEANUP] Delete response for', groupName, ':', response.status)

          if (response.status !== 204 && response.status !== 404) {
            throw new Error(
              `Failed to delete orphaned group ${groupName}: Status ${response.status}`
            )
          }
        })()
      )
    }
  }

  console.log('[CLEANUP] Delete promises created:', deletePromises.length)

  const results = await Promise.allSettled(deletePromises)
  const failures = results.filter((r) => r.status === 'rejected')

  if (failures.length > 0) {
    const errorMessages = failures.map((f: any) => f.reason?.message || f.reason)
    throw new Error(`Orphaned group cleanup failed: ${errorMessages.join('; ')}`)
  }

  console.log('[CLEANUP] Orphaned group cleanup completed')
}

const cleanUpGroup = async (adminUser: User) => {
  if (config.predefinedUsers || !adminUser) {
    return
  }

  console.log('[CLEANUP-GROUP] Starting group cleanup...')
  console.log('[CLEANUP-GROUP] Store entries:', Array.from(store.createdGroupStore.entries()))

  // Delete groups from the store using their UUID (which stays the same even when renamed)
  const deletePromises: Promise<void>[] = []
  for (const [key, group] of store.createdGroupStore.entries()) {
    if (!group.uuid) {
      console.log('[CLEANUP-GROUP] Skipping group without UUID:', key)
      continue
    }

    console.log('[CLEANUP-GROUP] Deleting group from store:', key, group.uuid, group.displayName)
    deletePromises.push(
      (async () => {
        try {
          const response = await request({
            method: 'DELETE',
            path: join('graph', 'v1.0', 'groups', group.uuid),
            user: adminUser
          })

          console.log(
            '[CLEANUP-GROUP] Delete response for',
            group.displayName,
            ':',
            response.status
          )

          if (response.status !== 204 && response.status !== 404) {
            throw new Error(
              `Failed to delete group ${key} (${group.uuid}): Status ${response.status}`
            )
          }
        } catch (error) {
          throw new Error(`Failed to cleanup group ${key} (${group.uuid}): ${error}`)
        }
      })()
    )
  }

  console.log('[CLEANUP-GROUP] Delete promises created:', deletePromises.length)

  const results = await Promise.allSettled(deletePromises)
  const failures = results.filter((r) => r.status === 'rejected')

  if (failures.length > 0) {
    const errorMessages = failures.map((f: any) => f.reason?.message || f.reason)
    throw new Error(`Group cleanup failed: ${errorMessages.join('; ')}`)
  }

  store.createdGroupStore.clear()
  console.log('[CLEANUP-GROUP] Group cleanup completed')
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

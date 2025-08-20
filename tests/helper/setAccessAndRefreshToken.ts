import { config } from '../e2e/config.js'
import { api, store } from '../e2e/support'
import { User } from '../e2e/support/types'
import { UsersEnvironment } from '../e2e/support/environment'

const storeKeycloakGroups = async (adminUser: User, usersEnvironment) => {
  const groups = await api.graph.getGroups(adminUser)

  store.dummyKeycloakGroupStore.forEach((dummyGroup) => {
    const matchingGroup = groups.find((group) => group.displayName === dummyGroup.displayName)
    if (matchingGroup) {
      usersEnvironment.storeCreatedGroup({ group: { ...dummyGroup, uuid: matchingGroup.id } })
    }
  })
}

export async function setAccessAndRefreshToken(usersEnvironment: UsersEnvironment) {
  if (!config.basicAuth && !config.predefinedUsers) {
    let user = usersEnvironment.getUser({ key: config.adminUsername })
    if (config.keycloak) {
      user = usersEnvironment.getUser({ key: config.keycloakAdminUser })
      await api.keycloak.setAccessTokenForKeycloakOcisUser(user)
      await api.keycloak.setAccessTokenForKeycloakUser(user)
      await storeKeycloakGroups(user, usersEnvironment)
    } else {
      await api.token.setAccessAndRefreshToken(user)
    }
  }
}

import { config } from '../../e2e/config.js'
import { api } from '../../e2e/support'
import { UsersEnvironment } from '../../e2e/support/environment'

export async function setAccessAndRefreshToken(usersEnvironment: UsersEnvironment) {
  if (!config.basicAuth && !config.predefinedUsers) {
    let user = usersEnvironment.getUser({ key: config.adminUsername })
    await api.token.setAccessAndRefreshToken(user)
  }
}

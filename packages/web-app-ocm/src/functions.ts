import { FederatedConnection, FederatedUser } from './types'

export const getConnectionId = (user: FederatedUser) => {
  return `${user.user_id}@${user.idp}`
}

export const buildConnection = (user: FederatedUser): FederatedConnection => {
  return {
    id: getConnectionId(user),
    ...user
  }
}

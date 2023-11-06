export type FederatedUser = {
  display_name: string
  idp: string
  mail: string
  user_id: string
}

export type FederatedConnection = FederatedUser & {
  id: string
}

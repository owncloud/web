export interface RuntimeConfiguration {
  serverUrl: string
}

export interface OAuth2Configuration {
  clientId: string
  clientSecret?: string
  url: string
  authUrl: string
  logoutUrl?: string
}

export interface OIDCConfiguration {
  // eslint-disable-next-line camelcase
  metadata_url: string
  authority: string
  // eslint-disable-next-line camelcase
  client_id: string
  // eslint-disable-next-line camelcase
  response_type: string
  scope: string
}

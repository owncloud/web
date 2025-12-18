// Frontend types
export interface WayfProvider {
  name: string
  fqdn: string
  // Can be empty, relative path, or absolute URL
  inviteAcceptDialog: string
}

export interface WayfFederation {
  [federationName: string]: WayfProvider[]
}

// Backend API response types
export interface FederationServerResponse {
  displayName: string
  url: string
  inviteAcceptDialog: string
}

export interface FederationResponse {
  federation: string
  servers: FederationServerResponse[]
}

export type FederationsApiResponse = FederationResponse[]

export interface DiscoverRequest {
  domain: string
}

export interface DiscoverResponse {
  inviteAcceptDialog: string
  provider?: string
  apiVersion?: string
}

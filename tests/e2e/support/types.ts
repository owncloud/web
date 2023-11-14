import { BrowserContext, Page } from '@playwright/test'

export interface Link {
  name: string
  url: string
  password?: string
}

export interface Space {
  name: string
  id: string
}

export interface Actor {
  context: BrowserContext
  page: Page
  close(): Promise<void>
  newPage(page: Page): Promise<Page>
}

export interface User {
  /**
   * actual id, that will be exposed by the graph api
   */
  uuid?: string
  id: string
  displayName: string
  password: string
  email: string
}

export interface File {
  name: string
  path: string
}

export interface Me {
  id: string
}

export interface Group {
  uuid?: string
  id: string
  displayName: string
}

export interface Token {
  userId: string
  accessToken: string
  refreshToken: string
}

// keycloak realm role
export interface KeycloakRealmRole {
  id: string
  name: string
}

import { BrowserContext, Page } from 'playwright'

export interface Actor {
  context: BrowserContext
  page: Page
  beforeClose(): Promise<void>
  close(): Promise<void>
}

export interface User {
  id: string
  displayName: string
  password: string
  email: string
}

export interface File {
  name: string
  path: string
}

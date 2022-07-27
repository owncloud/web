import { BrowserContext, Page } from 'playwright'

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

export interface Me {
  id: string
}

export interface Group {
  id: string
  displayName: string
}

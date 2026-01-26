import { test as base } from '@playwright/test'
import { cleanUpGroup } from '../steps/api/api'
import { UsersEnvironment } from '../../e2e/support/environment'

const usersEnvironment = new UsersEnvironment()

export const test = base.extend<{usersEnvironment: UsersEnvironment}>({
  usersEnvironment: async ({}, use) => {
    await use(usersEnvironment)
  }
})

test.afterEach(async ({ usersEnvironment }) => {
  const admin = usersEnvironment.getUser({ key: 'Admin' })
  await cleanUpGroup(admin)
})
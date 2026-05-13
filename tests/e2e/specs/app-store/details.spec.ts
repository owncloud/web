import { test } from '../../environment/test'
import * as ui from '../../steps/ui/index'

test.describe('details', { tag: '@predefined-users' }, () => {
  test('Apps can be viewed and downloaded', async ({ world }) => {
    // When "Admin" logs in
    await ui.userLogsIn({ world, stepUser: 'Admin' })

    // And "Admin" navigates to the app store
    await ui.userOpensAppStore({ world, stepUser: 'Admin' })

    // Then "Admin" should see the app store
    await ui.userShouldSeeAppStore({ world, stepUser: 'Admin' })

    // When "Admin" clicks on the app "Development boilerplate"
    await ui.userSelectsApp({
      world,
      stepUser: 'Admin',
      app: 'Development boilerplate'
    })

    // Then "Admin" should see the app details of "Development boilerplate"
    await ui.userShouldSeeAppDetails({
      world,
      stepUser: 'Admin',
      app: 'Development boilerplate'
    })

    // And "Admin" downloads app version "0.1.0"
    await ui.userDownloadsAppVersion({
      world,
      stepUser: 'Admin',
      version: '0.1.0'
    })

    // When "Admin" navigates back to the app store overview
    await ui.userNavigatesToAppStoreOverview({
      world,
      stepUser: 'Admin'
    })

    // Then "Admin" should see the app store
    await ui.userShouldSeeAppStore({ world, stepUser: 'Admin' })

    // And "Admin" downloads the latest version of the app "Development boilerplate"
    await ui.userDownloadsApp({
      world,
      stepUser: 'Admin',
      app: 'Development boilerplate'
    })

    // And "Admin" logs out
    await ui.userLogsOut({ world, stepUser: 'Admin' })
  })
})

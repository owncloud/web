import { test } from '../../support/test'
import * as ui from '../../steps/ui/index'

test.describe('details', { tag: '@predefined-users' }, () => {
  test('apps can be searched and downloaded', async ({ world }) => {
    // When "Admin" logs in
    await ui.userLogsIn({ world, stepUser: 'Admin' })

    // And "Admin" navigates to the app store
    await ui.userOpensAppStore({ world, stepUser: 'Admin' })

    // Then "Admin" should see the app store
    await ui.userShouldSeeAppStore({ world, stepUser: 'Admin' })

    // And "Admin" should see the following apps
    //   | app         |
    //   | Draw.io     |
    //   | JSON Viewer |
    //   | Unzip       |
    await ui.userShouldSeeApps({
      world,
      stepUser: 'Admin',
      expectedApps: ['Draw.io', 'JSON Viewer', 'Unzip']
    })

    // When "Admin" enters the search term "draw"
    await ui.userSetsSearchTerm({ world, stepUser: 'Admin', searchTerm: 'draw' })

    // Then "Admin" should see the following apps
    //   | app     |
    //   | Draw.io |
    await ui.userShouldSeeApps({
      world,
      stepUser: 'Admin',
      expectedApps: ['Draw.io']
    })

    // When "Admin" clicks on the tag "viewer" of the app "Draw.io"
    await ui.userSelectsAppTag({
      world,
      stepUser: 'Admin',
      tag: 'viewer',
      app: 'Draw.io'
    })

    // Then "Admin" should see the following apps
    //   | app         |
    //   | JSON Viewer |
    //   | Draw.io     |
    await ui.userShouldSeeApps({
      world,
      stepUser: 'Admin',
      expectedApps: ['Draw.io', 'JSON Viewer']
    })

    // When "Admin" clicks on the app "JSON Viewer"
    await ui.userSelectsApp({ world, stepUser: 'Admin', app: 'JSON Viewer' })

    // Then "Admin" should see the app details of "JSON Viewer"
    await ui.userShouldSeeAppDetails({
      world,
      stepUser: 'Admin',
      app: 'JSON Viewer'
    })

    // When "Admin" clicks on the tag "viewer"
    await ui.userSelectsTag({ world, stepUser: 'Admin', tag: 'viewer' })

    // Then "Admin" should see the app store
    await ui.userShouldSeeAppStore({ world, stepUser: 'Admin' })

    // Then "Admin" should see the following apps
    //   | app         |
    //   | JSON Viewer |
    //   | Draw.io     |
    await ui.userShouldSeeApps({
      world,
      stepUser: 'Admin',
      expectedApps: ['Draw.io', 'JSON Viewer']
    })

    // And "Admin" logs out
    await ui.userLogsOut({ world, stepUser: 'Admin' })
  })
})

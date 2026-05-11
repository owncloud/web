import { test } from '../../environment/test'
import * as ui from '../../steps/ui/index'

test.describe('general management', () => {
  test('mfa', async ({ world }) => {
    await ui.userLogsIn({ world, stepUser: 'Admin' })
    await ui.userOpensApplication({ world, stepUser: 'Admin', name: 'admin-settings' })
    await ui.userAuthenticatesWithOTP({
      world,
      stepUser: 'Admin',
      deviceName: 'test'
    })
    await ui.userNavigatesToProjectSpaceManagementPage({ world, stepUser: 'Admin' })
    await ui.userLogsOut({ world, stepUser: 'Admin' })
    await ui.userLogsIn({ world, stepUser: 'Admin' })
    await ui.userOpensApplication({ world, stepUser: 'Admin', name: 'admin-settings' })
    await ui.logInWithOTP({ world, stepUser: 'Admin' })
    await ui.userNavigatesToProjectSpaceManagementPage({ world, stepUser: 'Admin' })
  })
})

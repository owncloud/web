import { test } from '../../environment/test'
import * as ui from '../../steps/ui/index'

test.describe('general management', () => {
  test('logo can be changed in the admin settings', async ({ world }) => {
    await ui.userLogsIn({ world, stepUser: 'Admin' })
    await ui.userOpensApplication({ world, stepUser: 'Admin', name: 'admin-settings' })
    await ui.userNavigatesToGeneralManagementPage({ world, stepUser: 'Admin' })
    await ui.userUploadsLogoFromLocalPath({
      world,
      stepUser: 'Admin',
      localFile: 'filesForUpload/testavatar.png'
    })
    await ui.userNavigatesToGeneralManagementPage({ world, stepUser: 'Admin' })
    await ui.userResetsLogo({ world, stepUser: 'Admin' })
    await ui.userLogsOut({ world, stepUser: 'Admin' })
  })
})

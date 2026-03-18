import { test } from '../../support/test'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'

test.describe('GDPR export', { tag: '@predefined-users' }, () => {
  test.beforeEach(async ({ world }) => {
    await api.usersHaveBeenCreated({
      world,
      stepUser: 'Admin',
      users: ['Alice']
    })
    await ui.userLogsIn({ world, stepUser: 'Alice' })
  })

  test('create and download a GDPR export', async ({ world }) => {
    // And "Alice" opens the user menu
    await ui.userOpensAccountPage({ world, stepUser: 'Alice' })
    // And "Alice" requests a new GDPR export
    await ui.userRequestsGdprExport({ world, stepUser: 'Alice' })
    // And "Alice" downloads the GDPR export
    await ui.userDownloadsGdprExport({ world, stepUser: 'Alice' })
    // And "Alice" logs out
    await ui.userLogsOut({ world, stepUser: 'Alice' })
  })
})

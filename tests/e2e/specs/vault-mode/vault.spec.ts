import { test } from '../../environment/test'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'

test.describe('Vault Mode Access and Authentication', { tag: '@predefined-users' }, () => {

  test.beforeEach(async ({ world }) => {
    await api.usersHaveBeenCreated({
      world,
      stepUser: 'Admin',
      users: ['Alice']
    })
    await ui.userLogsIn({ world, stepUser: 'Alice' })
  })

  test('User with vault permission can access Vault mode with second factor authentication', async ({ world }) => {
    await ui.userIsInDriveMode({
      world,
      stepUser: 'Alice'
    })

    await ui.userSwitchesToVaultMode({
      world,
      stepUser: 'Alice'
    })

    await ui.userIsRedirectedToAuthenticatorPage({
      world,
      stepUser: 'Alice'
    })

    await ui.userAuthenticatesToVault({
      world,
      stepUser: 'Alice'
    })

    await ui.userIsInVaultMode({
      world,
      stepUser: 'Alice'
    })

    await ui.userSwitchesToDriveMode({
      world,
      stepUser: 'Alice'
    })

    await ui.userIsInDriveMode({
      world,
      stepUser: 'Alice'
    })
  })
})
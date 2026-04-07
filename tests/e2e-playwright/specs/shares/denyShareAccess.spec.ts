import { test } from '../../support/test'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'

test.describe('deny share access', () => {
  test.beforeEach(async ({ world }) => {
    await api.usersHaveBeenCreated({
      world,
      stepUser: 'Admin',
      users: ['Alice', 'Brian']
    })

    await ui.userLogsIn({ world, stepUser: 'Alice' })
    await ui.userLogsIn({ world, stepUser: 'Brian' })

    await api.userHasCreatedFolders({
      world,
      stepUser: 'Alice',
      folderNames: [
        'folder_to_shared',
        'folder_to_shared/folder',
        'folder_to_shared/folder_to_deny'
      ]
    })

    await ui.userOpensApplication({ world, stepUser: 'Alice', name: 'files' })

    await ui.userSharesResources({
      world,
      stepUser: 'Alice',
      actionType: 'SIDEBAR_PANEL',
      shares: [
        {
          resource: 'folder_to_shared',
          recipient: 'Brian',
          type: 'user',
          role: 'Can view',
          resourceType: 'folder'
        }
      ]
    })

    await ui.userOpensResource({
      world,
      stepUser: 'Alice',
      resource: 'folder_to_shared'
    })

    await ui.userSharesResources({
      world,
      stepUser: 'Alice',
      actionType: 'SIDEBAR_PANEL',
      shares: [
        {
          resource: 'folder_to_deny',
          recipient: 'Brian',
          type: 'user',
          role: 'Cannot access',
          resourceType: 'folder'
        }
      ]
    })
  })

  test('deny and grant access', async ({ world }) => {
    // deny access
    await ui.userOpensApplication({
      world,
      stepUser: 'Brian',
      name: 'files'
    })

    await ui.userNavigatesToSharedWithMePage({ world, stepUser: 'Brian' })
    await ui.userOpensResource({
      world,
      stepUser: 'Brian',
      resource: 'folder_to_shared'
    })

    await ui.userShouldNotSeeTheResources({
      world,
      listType: displayedResources.filesList,
      stepUser: 'Brian',
      resources: ['folder_to_deny']
    })

    await ui.userOpensApplication({
      world,
      stepUser: 'Alice',
      name: 'files'
    })

    await ui.userOpensResource({
      world,
      stepUser: 'Alice',
      resource: 'folder_to_shared'
    })

    // allow access - deleting "Cannot access" share

    await ui.userRemovesSharees({
      world,
      stepUser: 'Alice',
      sharees: [
        {
          resource: 'folder_to_deny',
          recipient: 'Brian'
        }
      ]
    })
    await ui.userOpensApplication({ world, stepUser: 'Brian', name: 'files' })
    await ui.userNavigatesToSharedWithMePage({ world, stepUser: 'Brian' })
    await ui.userOpensResource({
      world,
      stepUser: 'Brian',
      resource: 'folder_to_shared'
    })
    await ui.userShouldSeeResources({
      world,
      listType: displayedResources.filesList
      stepUser: 'Brian',
      resources: ['folder_to_deny']
    })

    await ui.userLogsOut({ world, stepUser: 'Brian' })
    await ui.userLogsOut({ world, stepUser: 'Alice' })
  })
})

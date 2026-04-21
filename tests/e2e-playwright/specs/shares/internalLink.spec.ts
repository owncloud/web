import { test } from '../../support/test'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'

test.describe('internal link share', () => {
  test.beforeEach(async ({ world }) => {
    await api.usersHaveBeenCreated({
      world,
      stepUser: 'Admin',
      users: ['Alice', 'Brian']
    })

    await ui.userLogsIn({ world, stepUser: 'Alice' })
    await ui.userLogsIn({ world, stepUser: 'Brian' })

    await api.userHasCreatedFolder({ world, stepUser: 'Alice', folderName: 'myfolder' })

    await api.userHasSharedResources({
      world,
      stepUser: 'Alice',
      shares: [
        {
          resource: 'myfolder',
          recipient: 'Brian',
          type: 'user',
          role: 'Can edit',
          resourceType: 'folder'
        }
      ]
    })

    await api.userHasCreatedPublicLinkOfResource({
      world,
      stepUser: 'Alice',
      resource: 'myfolder',
      role: 'Invited people'
    })
  })

  test('opening a link with internal role', async ({ world }) => {
    await ui.userOpensPublicLink({
      world,
      stepUser: 'Brian',
      name: 'Unnamed link'
    })
    await ui.userNavigatesToSharedWithMePage({ world, stepUser: 'Brian' })
    await ui.userUploadsResources({
      world,
      stepUser: 'Brian',
      resources: [{ name: 'simple.pdf', to: 'myfolder' }]
    })
    await ui.userUpdatesShareeRoles({
      world,
      stepUser: 'Alice',
      roleUpdates: [
        {
          resource: 'myfolder',
          recipient: 'Brian',
          type: 'user',
          role: 'Can view',
          resourceType: 'folder'
        }
      ]
    })
    await ui.userLogsOut({ world, stepUser: 'Alice' })

    await ui.userShouldNotBeAbleToEditResource({
      world,
      stepUser: 'Brian',
      resource: 'myfolder'
    })
    await ui.userLogsOut({ world, stepUser: 'Brian' })
  })
})

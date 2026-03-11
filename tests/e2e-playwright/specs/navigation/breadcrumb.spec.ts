import { test } from '../../support/test'
import * as ui from '../../steps/ui/index'
import * as api from '../../steps/api/api'

test.describe('Access breadcrumb', { tag: '@predefined-users' }, () => {
  test.beforeEach(async ({ world }) => {
    await api.usersHaveBeenCreated({
      world,
      stepUser: 'Admin',
      users: ['Alice']
    })
    await ui.userLogsIn({ world, stepUser: 'Alice' })
  })

  test('Breadcrumb navigation', async ({ world }) => {
    await ui.userCreatesResources({
      world,
      stepUser: 'Alice',
      resources: [{ name: 'parent/folder%2Fwith%2FSlashes', type: 'folder' }]
    })
    await ui.userOpensResources({
      world,
      stepUser: 'Alice',
      resource: 'parent/folder%2Fwith%2FSlashes'
    })
    await ui.userCreatesResources({
      world,
      stepUser: 'Alice',
      resources: [{ name: `'single-double quotes"`, type: 'folder' }]
    })
    await ui.userOpensResources({
      world,
      stepUser: 'Alice',
      resource: `'single-double quotes"`
    })
    await ui.userCreatesResources({
      world,
      stepUser: 'Alice',
      resources: [{ name: `"inner" double quote`, type: 'folder' }]
    })
    await ui.userOpensResources({
      world,
      stepUser: 'Alice',
      resource: `"inner" double quote`
    })
    await ui.userCreatesResources({
      world,
      stepUser: 'Alice',
      resources: [{ name: 'sub-folder', type: 'folder' }]
    })
    await ui.userOpensResources({
      world,
      stepUser: 'Alice',
      resource: 'sub-folder'
    })
    await ui.userNavigatesToFolderViaBreadcrumb({
      world,
      stepUser: 'Alice',
      resource: `"inner" double quote`
    })
    await ui.userNavigatesToFolderViaBreadcrumb({
      world,
      stepUser: 'Alice',
      resource: `'single-double quotes"`
    })
    await ui.userNavigatesToFolderViaBreadcrumb({
      world,
      stepUser: 'Alice',
      resource: 'folder%2Fwith%2FSlashes'
    })
    await ui.userNavigatesToFolderViaBreadcrumb({
      world,
      stepUser: 'Alice',
      resource: 'parent'
    })
    await ui.userLogsOut({ world, stepUser: 'Alice' })
  })
})

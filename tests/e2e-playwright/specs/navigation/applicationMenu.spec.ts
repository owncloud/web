import { test } from '../../support/test'
import * as ui from '../../steps/ui/index'
import * as api from '../../steps/api/api'
import { displayedResources } from '../../support/constants'

test.describe('Application menu', { tag: '@predefined-users' }, () => {
  test.beforeEach(async ({ world }) => {
    await api.usersHaveBeenCreated({
      world,
      stepUser: 'Admin',
      users: ['Alice']
    })
    await ui.userLogsIn({ world, stepUser: 'Alice' })
  })

  test('Open text editor via application menu', async ({ world }) => {
    await ui.userOpensApplication({ world, stepUser: 'Alice', name: 'text-editor' })
    await ui.userAddsContentInTextEditor({
      world,
      stepUser: 'Alice',
      text: 'Hello world'
    })
    await ui.userSavesTextEditor({ world, stepUser: 'Alice' })
    await ui.userClosesFileViewer({ world, stepUser: 'Alice' })
    await ui.userShouldSeeResources({
      world,
      listType: displayedResources.filesList,
      stepUser: 'Alice',
      resources: ['New file.txt']
    })
    await ui.userLogsOut({ world, stepUser: 'Alice' })
  })
})

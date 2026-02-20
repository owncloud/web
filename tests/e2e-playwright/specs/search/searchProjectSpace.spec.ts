import { test } from '../../support/test'
import { config } from '../../../e2e/config.js'
import {
  ActorsEnvironment,
  UsersEnvironment,
  SpacesEnvironment,
  FilesEnvironment
} from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'

test.describe('Search in the project space', () => {
  let actorsEnvironment
  const usersEnvironment = new UsersEnvironment()
  const spacesEnvironment = new SpacesEnvironment()
  const filesEnvironment = new FilesEnvironment()

  test.beforeEach(async ({ browser }) => {
    actorsEnvironment = new ActorsEnvironment({
      context: {
        acceptDownloads: config.acceptDownloads,
        reportDir: config.reportDir,
        tracingReportDir: config.tracingReportDir,
        reportHar: config.reportHar,
        reportTracing: config.reportTracing,
        reportVideo: config.reportVideo,
        failOnUncaughtConsoleError: config.failOnUncaughtConsoleError
      },
      browser: browser
    })

    await setAccessAndRefreshToken(usersEnvironment)

    await api.usersHasBeenCreated({
      usersEnvironment,
      stepUser: 'Admin',
      users: ['Alice']
    })

    await api.userHasAssignRolesToUsers({
      usersEnvironment,
      stepUser: 'Admin',
      targetUserId: 'Alice',
      role: 'Space Admin'
    })

    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })

    await api.userHasCreatedProjectSpace({
      usersEnvironment,
      spacesEnvironment,
      stepUser: 'Alice',
      name: 'team',
      id: 'team.1'
    })

    await ui.navigateToSpace({ actorsEnvironment, stepUser: 'Alice', space: 'team.1' })

    await ui.userCreatesResources({
      actorsEnvironment,
      stepUser: 'Alice',
      resources: [{ name: 'folder(WithSymbols:!;_+-&)', type: 'folder' }]
    })

    await ui.uploadResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      resources: [{ name: "new-'single'quotes.txt", to: 'folder(WithSymbols:!;_+-&)' }]
    })

    await ui.navigateToPersonalSpacePage({ actorsEnvironment, stepUser: 'Alice' })
  })

  test('Search in the project spaces', async () => {
    // search for project space objects
    await ui.searchGloballyWithFilter({
      actorsEnvironment,
      stepUser: 'Alice',
      keyword: "-'s",
      filter: 'all files'
    })

    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'search list',
      stepUser: 'Alice',
      resources: ["new-'single'quotes.txt"]
    })

    await ui.userShouldNotSeeTheResources({
      actorsEnvironment,
      listType: 'search list',
      stepUser: 'Alice',
      resources: ['folder(WithSymbols:!;_+-&)']
    })

    await ui.searchGloballyWithFilter({
      actorsEnvironment,
      stepUser: 'Alice',
      keyword: '!;_+-&)',
      filter: 'all files'
    })

    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'search list',
      stepUser: 'Alice',
      resources: ['folder(WithSymbols:!;_+-&)']
    })

    await ui.userShouldNotSeeTheResources({
      actorsEnvironment,
      listType: 'search list',
      stepUser: 'Alice',
      resources: ["new-'single'quotes.txt"]
    })

    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  })
})

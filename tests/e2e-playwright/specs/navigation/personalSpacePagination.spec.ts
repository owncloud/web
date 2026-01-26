import { test } from '@playwright/test'
import { config } from '../../../e2e/config.js'
import { ActorsEnvironment, UsersEnvironment } from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken.js'
import * as api from '../../steps/api/api.js'
import * as ui from '../../steps/ui/index'

test.describe('Personal space pagination', { tag: '@predefined-users' }, () => {
  let actorsEnvironment: ActorsEnvironment
  const usersEnvironment = new UsersEnvironment()

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
  })

  test.afterEach(async () => {
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
  })

  test('pagination', async () => {
    // Given "Admin" creates following user using API
    //   | id    |
    //   | Alice |
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Alice' })

    // And "Alice" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })

    // And "Alice" creates 15 folders in personal space using API
    for (let i = 0; i < 15; i++) {
      await api.userHasCreatedFolder({
        usersEnvironment,
        stepUser: 'Alice',
        folderName: `folder${i}`
      })
    }
    // And "Alice" creates 10 files in personal space using API
    for (let i = 0; i < 15; i++) {
      await api.userHasCreatedFile({
        usersEnvironment,
        stepUser: 'Alice',
        filename: `file${i}`
      })
    }
    // And "Alice" creates the following files into personal space using API
    //   | pathToFile           | content                |
    //   | .hidden-testFile.txt | This is a hidden file. |
    await api.userHasCreatedFile({
      usersEnvironment,
      stepUser: 'Alice',
      filename: '.hidden-testFile.txt',
      content: 'This is a hidden file.'
    })
    // When "Alice" opens the "files" app
    await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Alice', name: 'files' })
    // And "Alice" changes the items per page to "20"
    await ui.changeItemsPerPage({ actorsEnvironment, stepUser: 'Alice', itemsPerPage: '20' })
    // Then "Alice" should see the text "26 items with 223 B in total (11 files including 1 hidden, 15 folders)" at the footer of the page
    await ui.expectFooterTextToBe({
      actorsEnvironment,
      stepUser: 'Alice',
      expectedText: '26 items with 223 B in total (11 files including 1 hidden, 15 folders)'
    })
    // When "Alice" navigates to page "2" of the personal space files view
    await ui.navigateToPageNumber({ actorsEnvironment, stepUser: 'Alice', pageNumber: '2' })
    // Then "Alice" should see 5 resources in the personal space files view
    await ui.assertToHaveNoOfFiles({
      actorsEnvironment,
      stepUser: 'Alice',
      expectedNumberOfResources: 5
    })
    // When "Alice" enables the option to display the hidden file
    await ui.showHiddenFiles({ actorsEnvironment, stepUser: 'Alice' })
    // Then "Alice" should see 6 resources in the personal space files view
    await ui.assertToHaveNoOfFiles({
      actorsEnvironment,
      stepUser: 'Alice',
      expectedNumberOfResources: 6
    })
    // When "Alice" changes the items per page to "500"
    await ui.changeItemsPerPage({ actorsEnvironment, stepUser: 'Alice', itemsPerPage: '20' })

    // Then "Alice" should not see the pagination in the personal space files view
    await ui.expectPageNumberNotToBeVisible({ actorsEnvironment, stepUser: 'Alice' })

    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  })
})

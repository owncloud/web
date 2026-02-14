import { expect, test } from '@playwright/test'
import { config } from '../../../e2e/config.js'
import {
  ActorsEnvironment,
  UsersEnvironment,
  SpacesEnvironment
} from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'
import { editor } from '../../../e2e/support/objects/app-files/utils/index.js'

test.describe('check files pagination in project space', () => {
  let actorsEnvironment
  const usersEnvironment = new UsersEnvironment()
  const spacesEnvironment = new SpacesEnvironment()

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
    // clean up users
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
  })

  test('pagination', async () => {
    // Given "Admin" creates following user using API
    //   | id    |
    //   | Alice |
    await api.usersHasBeenCreated({
      usersEnvironment,
      stepUser: 'Admin',
      users: ['Alice']
    })

    // And "Admin" assigns following roles to the users using API
    //   | id    | role        |
    //   | Alice | Space Admin |
    await api.userHasAssignRolesToUsers({
      usersEnvironment,
      stepUser: 'Admin',
      targetUserId: 'Alice',
      role: 'Space Admin'
    })

    // And "Alice" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })

    // And "Alice" creates the following project space using API
    //   | name       | id    |
    //   | Developers | dev.1 |
    await api.userHasCreatedProjectSpace({
      usersEnvironment,
      spacesEnvironment,
      stepUser: 'Alice',
      name: 'Developers',
      id: 'dev.1'
    })

    // And "Alice" creates 55 folders in space "Developers" using API
    await api.userHasCreatedFoldersInSpace({
      usersEnvironment,
      stepUser: 'Alice',
      spaceName: 'Developers',
      folders: Array.from({ length: 55 }, (_, i) => `testFolder${i + 1}`)
    })

    // And "Alice" creates 55 files in space "Developers" using API
    await api.createFilesInsideSpaceBySpaceName({
      usersEnvironment,
      stepUser: 'Alice',
      files: Array.from({ length: 55 }, (_, i) => ({
        name: `testfile${i + 1}.txt`,
        space: 'Developers',
        content: `This is a test file${i + 1}`
      }))
    })

    // And "Alice" creates the following file in space "Developers" using API
    //   | name                 | content                |
    //   | .hidden-testFile.txt | This is a hidden file. |
    await api.createFilesInsideSpaceBySpaceName({
      usersEnvironment,
      stepUser: 'Alice',
      files: [
        { name: '.hidden-testFile.txt', space: 'Developers', content: 'This is a hidden file.' }
      ]
    })

    // And "Alice" navigates to the project space "dev.1"
    await ui.navigateToSpace({ actorsEnvironment, stepUser: 'Alice', space: 'dev.1' })

    // When "Alice" navigates to page "2" of the project space files view
    await ui.navigateToPageNumber({ actorsEnvironment, stepUser: 'Alice', pageNumber: '2' })

    // Then "Alice" should see the text "112 items with 1 kB in total (56 files including 1 hidden, 56 folders including 1 hidden)" at the footer of the page
    await ui.expectFooterTextToBe({
      actorsEnvironment,
      stepUser: 'Alice',
      expectedText:
        '112 items with 1 kB in total (56 files including 1 hidden, 56 folders including 1 hidden)'
    })

    // And "Alice" should see 10 resources in the project space files view
    await ui.assertToHaveNoOfFiles({
      actorsEnvironment,
      stepUser: 'Alice',
      expectedNumberOfResources: 10
    })

    // When "Alice" enables the option to display the hidden file
    await ui.showHiddenFiles({ actorsEnvironment, stepUser: 'Alice' })

    // And "Alice" should see 12 resources in the project space files view
    await ui.assertToHaveNoOfFiles({
      actorsEnvironment,
      stepUser: 'Alice',
      expectedNumberOfResources: 12
    })

    // When "Alice" opens file "testfile45.txt"
    await ui.userOpensResources({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'testfile45.txt'
    })

    // And "Alice" closes the file viewer
    const { page } = actorsEnvironment.getActor({ key: 'Alice' })
    await editor.close(page)

    // Then "Alice" should be on page "2"
    const currentPage = await ui.getCurrentPageNumber({
      actorsEnvironment,
      stepUser: 'Alice',
      pageNumber: '2'
    })
    expect(currentPage).toBe('2')

    // When "Alice" changes the items per page to "500"
    await ui.changeItemsPerPage({ actorsEnvironment, stepUser: 'Alice', itemsPerPage: '500' })

    // Then "Alice" should not see the pagination in the project space files view
    await ui.expectPageNumberNotToBeVisible({ actorsEnvironment, stepUser: 'Alice' })

    // When "Alice" enables flat list
    await ui.toggleFlatList({ actorsEnvironment, stepUser: 'Alice' })

    // Then "Alice" should see files being sorted in alphabetic order
    const allFiles = await ui.getFilesList({ actorsEnvironment, stepUser: 'Alice' })
    const sortedFiles = [...allFiles].sort((a, b) =>
      a.localeCompare(b, 'en-us', { numeric: true, ignorePunctuation: true })
    )
    expect(allFiles).toEqual(sortedFiles)

    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  })
})

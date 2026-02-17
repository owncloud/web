import { test } from '@playwright/test'
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

test.describe('Search', () => {
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

    // Given "Admin" creates following users using API
    //   | id    |
    //   | Alice |
    //   | Brian |
    await api.usersHasBeenCreated({
      usersEnvironment,
      stepUser: 'Admin',
      users: ['Alice', 'Brian']
    })

    // And "Admin" assigns following roles to the users using API
    //   | id    | role        |
    //   | Brian | Space Admin |
    await api.userHasAssignedRolesToUsers({
      usersEnvironment,
      stepUser: 'Admin',
      users: [{ id: 'Brian', role: 'Space Admin' }]
    })

    // And "Alice" uploads the following local file into personal space using API
    //   | localFile                   | to              |
    //   | filesForUpload/textfile.txt | fileToShare.txt |
    await api.userHasUploadedFilesInPersonalSpace({
      usersEnvironment,
      stepUser: 'Alice',
      filesEnvironment,
      filesToUpload: [{ localFile: 'filesForUpload/textfile.txt', to: 'fileToShare.txt' }]
    })

    // And "Alice" adds the following tags for the following resources using API
    //   | resource        | tags      |
    //   | fileToShare.txt | alice tag |
    await api.userHasAddedTagsToResources({
      usersEnvironment,
      stepUser: 'Alice',
      tags: [{ resource: 'fileToShare.txt', tags: 'alice tag' }]
    })

    // And "Alice" shares the following resource using API
    //   | resource        | recipient | type | role     | resourceType |
    //   | fileToShare.txt | Brian     | user | Can edit | file         |
    await api.userHasSharedResources({
      usersEnvironment,
      stepUser: 'Alice',
      shares: [
        {
          resource: 'fileToShare.txt',
          recipient: 'Brian',
          type: 'user',
          role: 'Can edit',
          resourceType: 'file'
        }
      ]
    })

    // And "Brian" creates the following folder in personal space using API
    //   | name       |
    //   | testFolder |
    await api.userHasCreatedFolder({
      usersEnvironment,
      stepUser: 'Brian',
      folderName: 'testFolder'
    })

    // And "Brian" uploads the following local file into personal space using API
    //   | localFile                   | to                           |
    //   | filesForUpload/textfile.txt | textfile.txt                 |
    //   | filesForUpload/textfile.txt | fileWithTag.txt              |
    //   | filesForUpload/textfile.txt | withTag.txt                  |
    //   | filesForUpload/textfile.txt | testFolder/innerTextfile.txt |
    await api.userHasUploadedFilesInPersonalSpace({
      usersEnvironment,
      filesEnvironment,
      stepUser: 'Brian',
      filesToUpload: [
        { localFile: 'filesForUpload/textfile.txt', to: 'textfile.txt' },
        { localFile: 'filesForUpload/textfile.txt', to: 'fileWithTag.txt' },
        { localFile: 'filesForUpload/textfile.txt', to: 'withTag.txt' },
        { localFile: 'filesForUpload/textfile.txt', to: 'testFolder/innerTextfile.txt' }
      ]
    })

    // And "Brian" creates the following project spaces using API
    //   | name           | id               |
    //   | FullTextSearch | fulltextsearch.1 |
    await api.userHasCreatedProjectSpaces({
      usersEnvironment,
      spacesEnvironment,
      stepUser: 'Brian',
      spaces: [{ name: 'FullTextSearch', id: 'fulltextsearch.1' }]
    })

    // And "Brian" creates the following folder in space "FullTextSearch" using API
    //   | name        |
    //   | spaceFolder |
    await api.userHasCreatedFoldersInSpace({
      usersEnvironment,
      stepUser: 'Brian',
      spaceName: 'FullTextSearch',
      folders: ['spaceFolder']
    })

    // And "Brian" creates the following file in space "FullTextSearch" using API
    //   | name                          | content                   |
    //   | spaceFolder/spaceTextfile.txt | This is test file. Cheers |
    await api.createFilesInsideSpaceBySpaceName({
      usersEnvironment,
      stepUser: 'Brian',
      files: [
        {
          name: 'spaceFolder/spaceTextfile.txt',
          space: 'FullTextSearch',
          content: 'This is test file. Cheers'
        }
      ]
    })

    // And "Brian" adds the following tags for the following resources using API
    //   | resource        | tags  |
    //   | fileWithTag.txt | tag 1 |
    //   | withTag.txt     | tag 1 |
    await api.userHasAddedTagsToResources({
      usersEnvironment,
      stepUser: 'Brian',
      tags: [
        { resource: 'fileWithTag.txt', tags: 'tag 1' },
        { resource: 'withTag.txt', tags: 'tag 1' }
      ]
    })

    // And "Brian" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })
  })

  test.afterEach(async () => {
    // clean up users
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Brian' })
  })

  test('Search for content of file', async () => {
    // When "Brian" searches "" using the global search and the "all files" filter and presses enter
    await ui.searchGloballyWithFilter({
      actorsEnvironment,
      stepUser: 'Brian',
      keyword: 'Cheers',
      filter: 'all files',
      command: 'presses enter'
    })

    // Then "Brian" should see the message "Search for files" on the search result
    await ui.userShouldSeeMessageOnSearchResult({
      actorsEnvironment,
      stepUser: 'Brian',
      message: 'Search for files'
    })

    // When "Brian" selects tag "alice tag" from the search result filter chip
    await ui.userFiltersSearchResultWithTag({
      actorsEnvironment,
      stepUser: 'Brian',
      tag: 'alice tag'
    })

    // Then following resources should be displayed in the files list for user "Brian"
    //   | resource        |
    //   | fileToShare.txt |
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'files list',
      stepUser: 'Brian',
      resources: ['fileToShare.txt']
    })

    // When "Brian" clears tags filter
    await ui.userClearsFilter({ actorsEnvironment, stepUser: 'Brian', filter: 'tags' })

    // And "Brian" selects tag "tag 1" from the search result filter chip
    await ui.userFiltersSearchResultWithTag({
      actorsEnvironment,
      stepUser: 'Brian',
      tag: 'tag 1'
    })

    // Then following resources should be displayed in the files list for user "Brian"
    //   | resource        |
    //   | fileWithTag.txt |
    //   | withTag.txt     |
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'files list',
      stepUser: 'Brian',
      resources: ['fileWithTag.txt', 'withTag.txt']
    })

    // When "Brian" searches "file" using the global search and the "all files" filter and presses enter
    await ui.searchGloballyWithFilter({
      actorsEnvironment,
      stepUser: 'Brian',
      keyword: 'file',
      filter: 'all files',
      command: 'presses enter'
    })

    // Then following resources should be displayed in the files list for user "Brian"
    //   | resource        |
    //   | fileWithTag.txt |
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'files list',
      stepUser: 'Brian',
      resources: ['fileWithTag.txt']
    })

    // When "Brian" clears tags filter
    await ui.userClearsFilter({ actorsEnvironment, stepUser: 'Brian', filter: 'tags' })
    // Then following resources should be displayed in the files list for user "Brian"
    //   | resource                      |
    //   | textfile.txt                  |
    //   | fileWithTag.txt               |
    //   | testFolder/innerTextfile.txt  |
    //   | fileToShare.txt               |
    //   | spaceFolder/spaceTextfile.txt |
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'files list',
      stepUser: 'Brian',
      resources: [
        'textfile.txt',
        'fileWithTag.txt',
        'testFolder/innerTextfile.txt',
        'fileToShare.txt',
        'spaceFolder/spaceTextfile.txt'
      ]
    })

    // When "Brian" searches "Cheers" using the global search and the "all files" filter and presses enter
    await ui.searchGloballyWithFilter({
      actorsEnvironment,
      stepUser: 'Brian',
      keyword: 'Cheers',
      filter: 'all files',
      command: 'presses enter'
    })
    // Then following resources should be displayed in the files list for user "Brian"
    //   | resource                      |
    //   | textfile.txt                  |
    //   | testFolder/innerTextfile.txt  |
    //   | fileToShare.txt               |
    //   | fileWithTag.txt               |
    //   | withTag.txt                   |
    //   | spaceFolder/spaceTextfile.txt |
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'files list',
      stepUser: 'Brian',
      resources: [
        'textfile.txt',
        'fileWithTag.txt',
        'testFolder/innerTextfile.txt',
        'fileToShare.txt',
        'withTag.txt',
        'spaceFolder/spaceTextfile.txt'
      ]
    })
    // When "Brian" opens the following file in texteditor
    //   | resource     |
    //   | textfile.txt |
    await ui.openResourceInViewer({
      actorsEnvironment,
      stepUser: 'Brian',
      resource: 'textfile.txt',
      application: 'texteditor'
    })
    // And "Brian" closes the file viewer
    await ui.userClosesFileViewer({ actorsEnvironment, stepUser: 'Brian' })
    // Then following resources should be displayed in the files list for user "Brian"
    //   | resource                      |
    //   | textfile.txt                  |
    //   | testFolder/innerTextfile.txt  |
    //   | fileToShare.txt               |
    //   | fileWithTag.txt               |
    //   | withTag.txt                   |
    //   | spaceFolder/spaceTextfile.txt |
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'files list',
      stepUser: 'Brian',
      resources: [
        'textfile.txt',
        'testFolder/innerTextfile.txt',
        'fileToShare.txt',
        'fileWithTag.txt',
        'withTag.txt',
        'spaceFolder/spaceTextfile.txt'
      ]
    })
    // And "Brian" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Brian' })
  })
})

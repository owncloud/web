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

test.describe('Search', { tag: '@predefined-users' }, () => {
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
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Alice' })
  })

  test.afterEach(async () => {
    // clean up users
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
  })

  test('Search in personal spaces', async () => {
    // Given "Admin" creates following users using API
    //   | id    |
    //   | Brian |
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Brian' })
    // And "Brian" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })

    // And "Alice" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })

    // And "Brian" creates the following folder in personal space using API
    //   | name                 |
    //   | new_share_from_brian |
    await api.userHasCreatedFolder({
      usersEnvironment,
      stepUser: 'Brian',
      folderName: 'new_share_from_brian'
    })

    // And "Brian" uploads the following local file into personal space using API
    //   | localFile                        | to                |
    //   | filesForUpload/new-lorem-big.txt | new-lorem-big.txt |
    await api.userHasUploadedFilesInPersonalSpace({
      usersEnvironment,
      stepUser: 'Brian',
      filesEnvironment,
      filesToUpload: [{ localFile: 'filesForUpload/new-lorem-big.txt', to: 'new-lorem-big.txt' }]
    })
    // And "Brian" shares the following resource using the sidebar panel
    //   | resource             | recipient | type | role     | resourceType |
    //   | new_share_from_brian | Alice     | user | Can view | folder       |
    //   | new-lorem-big.txt    | Alice     | user | Can view | file         |
    await ui.shareResource({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Brian',
      resource: 'new_share_from_brian',
      recipient: 'Alice',
      type: 'user',
      role: 'Can view',
      resourceType: 'folder',
      actionType: 'SIDEBAR_PANEL'
    })
    await ui.shareResource({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Brian',
      resource: 'new-lorem-big.txt',
      recipient: 'Alice',
      type: 'user',
      role: 'Can view',
      resourceType: 'file',
      actionType: 'SIDEBAR_PANEL'
    })
    // And "Brian" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Brian' })

    // And "Alice" creates the following resources
    //   | resource                   | type   |
    //   | folder                     | folder |
    //   | FolDer/child-one/child-two | folder |
    //   | strängéनेपालीName          | folder |
    await ui.createResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'folder',
      type: 'folder'
    })
    await ui.createResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'FolDer/child-one/child-two',
      type: 'folder'
    })
    await ui.createResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'strängéनेपालीName',
      type: 'folder'
    })

    // And "Alice" enables the option to display the hidden file
    await ui.showHiddenFiles({ actorsEnvironment, stepUser: 'Alice' })

    // And "Alice" uploads the following resources
    //   | resource         |
    //   | .hidden-file.txt |
    await ui.uploadResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      resource: '.hidden-file.txt'
    })

    // # search for objects of personal space
    // When "Alice" searches "foldeR" using the global search and the "all files" filter
    await ui.searchGloballyWithFilter({
      actorsEnvironment,
      stepUser: 'Alice',
      keyword: 'foldeR',
      filter: 'all files'
    })
    // Then following resources should be displayed in the search list for user "Alice"
    //   | resource |
    //   | folder   |
    //   | FolDer   |
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'search list',
      stepUser: 'Alice',
      resources: ['folder', 'FolDer']
    })

    // But following resources should not be displayed in the search list for user "Alice"
    //   | resource             |
    //   | new_share_from_brian |
    //   | new-lorem-big.txt    |
    //   | .hidden-file.txt     |
    await ui.userShouldNotSeeTheResources({
      actorsEnvironment,
      listType: 'search list',
      stepUser: 'Alice',
      resources: ['new_share_from_brian', 'new-lorem-big.txt', '.hidden-file.txt']
    })

    // # search for hidden file
    // When "Alice" searches "hidden" using the global search and the "all files" filter
    await ui.searchGloballyWithFilter({
      actorsEnvironment,
      stepUser: 'Alice',
      keyword: 'hidden',
      filter: 'all files'
    })
    // Then following resources should be displayed in the search list for user "Alice"
    //   | resource         |
    //   | .hidden-file.txt |
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'search list',
      stepUser: 'Alice',
      resources: ['.hidden-file.txt']
    })
    // But following resources should not be displayed in the search list for user "Alice"
    //   | resource          |
    //   | folder            |
    //   | FolDer            |
    //   | PARENT            |
    //   | new-lorem-big.txt |
    await ui.userShouldNotSeeTheResources({
      actorsEnvironment,
      listType: 'search list',
      stepUser: 'Alice',
      resources: ['folder', 'FolDer', 'PARENT', 'new-lorem-big.txt']
    })

    // # subfolder search
    // And "Alice" searches "child" using the global search and the "all files" filter
    await ui.searchGloballyWithFilter({
      actorsEnvironment,
      stepUser: 'Alice',
      keyword: 'child',
      filter: 'all files'
    })
    // Then following resources should be displayed in the search list for user "Alice"
    //   | resource  |
    //   | child-one |
    //   | child-two |
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'search list',
      stepUser: 'Alice',
      resources: ['child-one', 'child-two']
    })
    // But following resources should not be displayed in the search list for user "Alice"
    //   | resource          |
    //   | folder            |
    //   | FolDer            |
    //   | folder_from_brian |
    //   | .hidden-file.txt  |
    //   | new-lorem-big.txt |
    await ui.userShouldNotSeeTheResources({
      actorsEnvironment,
      listType: 'search list',
      stepUser: 'Alice',
      resources: ['folder', 'FolDer', 'folder_from_brian', '.hidden-file.txt', 'new-lorem-big.txt']
    })

    // # received shares search
    // And "Alice" searches "NEW" using the global search and the "all files" filter
    await ui.searchGloballyWithFilter({
      actorsEnvironment,
      stepUser: 'Alice',
      keyword: 'NEW',
      filter: 'all files'
    })
    // Then following resources should be displayed in the search list for user "Alice"
    //   | resource             |
    //   | new_share_from_brian |
    //   | new-lorem-big.txt    |
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'search list',
      stepUser: 'Alice',
      resources: ['new_share_from_brian', 'new-lorem-big.txt']
    })
    // But following resources should not be displayed in the search list for user "Alice"
    //   | resource         |
    //   | folder           |
    //   | FolDer           |
    //   | .hidden-file.txt |
    await ui.userShouldNotSeeTheResources({
      actorsEnvironment,
      listType: 'search list',
      stepUser: 'Alice',
      resources: ['folder', 'FolDer', '.hidden-file.txt']
    })
    // And "Alice" opens the "files" app
    await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Alice', name: 'files' })

    // # search renamed resources
    // When "Alice" renames the following resource
    //   | resource | as            |
    //   | folder   | renamedFolder |
    //   | FolDer   | renamedFolDer |
    await ui.userRenamesResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'folder',
      as: 'renamedFolder'
    })
    await ui.userRenamesResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'FolDer',
      as: 'renamedFolDer'
    })
    // And "Alice" searches "rena" using the global search and the "all files" filter
    await ui.searchGloballyWithFilter({
      actorsEnvironment,
      stepUser: 'Alice',
      keyword: 'rena',
      filter: 'all files'
    })
    // Then following resources should be displayed in the search list for user "Alice"
    //   | resource      |
    //   | renamedFolder |
    //   | renamedFolDer |
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'search list',
      stepUser: 'Alice',
      resources: ['renamedFolder', 'renamedFolDer']
    })
    // But following resources should not be displayed in the search list for user "Alice"
    //   | resource |
    //   | folder   |
    //   | FolDer   |
    await ui.userShouldNotSeeTheResources({
      actorsEnvironment,
      listType: 'search list',
      stepUser: 'Alice',
      resources: ['folder', 'FolDer']
    })

    // # search difficult names
    // When "Alice" searches "strängéनेपालीName" using the global search and the "all files" filter and presses enter
    await ui.searchGloballyWithFilter({
      actorsEnvironment,
      stepUser: 'Alice',
      keyword: 'strängéनेपालीName',
      filter: 'all files',
      command: 'presses enter'
    })
    // And "Alice" enables the option to search title only
    await ui.userEnablesOptionToSearchTitleOnly({ actorsEnvironment, stepUser: 'Alice' })
    // Then following resources should be displayed in the files list for user "Alice"
    //   | strängéनेपालीName |
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'files list',
      stepUser: 'Alice',
      resources: ['strängéनेपालीName']
    })

    // # deleting folder from search result and search deleted resource
    // When "Alice" deletes the following resource using the sidebar panel
    //   | resource          | from |
    //   | strängéनेपालीName |      |
    await ui.deleteResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'strängéनेपालीName',
      actionType: 'SIDEBAR_PANEL'
    })

    // And "Alice" searches "forDeleting" using the global search and the "all files" filter
    await ui.searchGloballyWithFilter({
      actorsEnvironment,
      stepUser: 'Alice',
      keyword: 'forDeleting',
      filter: 'all files'
    })
    // Then following resources should not be displayed in the search list for user "Alice"
    //   | resource          |
    //   | strängéनेपालीName |
    await ui.userShouldNotSeeTheResources({
      actorsEnvironment,
      listType: 'search list',
      stepUser: 'Alice',
      resources: ['strängéनेपालीName']
    })

    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Brian' })
  })

  test('Search using "current folder" filter', async () => {
    // And "Alice" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
    // And "Alice" creates the following folders in personal space using API
    //   | name                 |
    //   | mainFolder/subFolder |
    await api.userHasCreatedFolder({
      usersEnvironment,
      stepUser: 'Alice',
      folderName: 'mainFolder/subFolder'
    })
    // And "Alice" creates the following files into personal space using API
    //   | pathToFile                                         | content                   |
    //   | exampleInsideThePersonalSpace.txt                  | I'm in the personal Space |
    //   | mainFolder/exampleInsideTheMainFolder.txt          | I'm in the main folder    |
    //   | mainFolder/subFolder/exampleInsideTheSubFolder.txt | I'm in the sub folder     |
    await api.userHasCreatedFile({
      usersEnvironment,
      stepUser: 'Alice',
      filename: 'exampleInsideThePersonalSpace.txt',
      content: "I'm in the personal Space"
    })
    await api.userHasCreatedFile({
      usersEnvironment,
      stepUser: 'Alice',
      filename: 'mainFolder/exampleInsideTheMainFolder.txt',
      content: "I'm in the main folder"
    })
    await api.userHasCreatedFile({
      usersEnvironment,
      stepUser: 'Alice',
      filename: 'mainFolder/subFolder/exampleInsideTheSubFolder.txt',
      content: "I'm in the sub folder"
    })
    // When "Alice" opens folder "mainFolder"
    await ui.openResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'mainFolder'
    })
    // And "Alice" searches "example" using the global search and the "all files" filter
    await ui.searchGloballyWithFilter({
      actorsEnvironment,
      stepUser: 'Alice',
      keyword: 'example',
      filter: 'all files'
    })
    // Then following resources should be displayed in the search list for user "Alice"
    //   | resource                          |
    //   | exampleInsideThePersonalSpace.txt |
    //   | exampleInsideTheMainFolder.txt    |
    //   | exampleInsideTheSubFolder.txt     |
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'search list',
      stepUser: 'Alice',
      resources: [
        'exampleInsideThePersonalSpace.txt',
        'exampleInsideTheMainFolder.txt',
        'exampleInsideTheSubFolder.txt'
      ]
    })

    // When "Alice" searches "example" using the global search and the "current folder" filter
    await ui.searchGloballyWithFilter({
      actorsEnvironment,
      stepUser: 'Alice',
      keyword: 'example',
      filter: 'current folder'
    })
    // Then following resources should be displayed in the search list for user "Alice"
    //   | resource                       |
    //   | exampleInsideTheMainFolder.txt |
    //   | exampleInsideTheSubFolder.txt  |
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'search list',
      stepUser: 'Alice',
      resources: ['exampleInsideTheMainFolder.txt', 'exampleInsideTheSubFolder.txt']
    })
    // But following resources should not be displayed in the search list for user "Alice"
    //   | resource                          |
    //   | exampleInsideThePersonalSpace.txt |
    await ui.userShouldNotSeeTheResources({
      actorsEnvironment,
      listType: 'search list',
      stepUser: 'Alice',
      resources: ['exampleInsideThePersonalSpace.txt']
    })
    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  })

  test('Search using mediaType filter', async () => {
    // And "Alice" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
    // And "Alice" creates the following folders in personal space using API
    //   | name      |
    //   | mediaTest |
    await api.userHasCreatedFolder({
      usersEnvironment,
      stepUser: 'Alice',
      folderName: 'mediaTest'
    })
    // And "Alice" uploads the following local file into personal space using API
    //   | localFile                     | to            |
    //   | filesForUpload/testavatar.jpg | mediaTest.jpg |
    await api.userHasUploadedFilesInPersonalSpace({
      usersEnvironment,
      stepUser: 'Alice',
      filesEnvironment,
      filesToUpload: [{ localFile: 'filesForUpload/testavatar.jpg', to: 'mediaTest.jpg' }]
    })
    // And "Alice" creates the following files into personal space using API
    //   | pathToFile    | content        |
    //   | mediaTest.txt | I'm a Document |
    //   | mediaTest.pdf | I'm a PDF      |
    //   | mediaTest.mp3 | I'm a Audio    |
    //   | mediaTest.zip | I'm a Archive  |
    await api.userHasCreatedFile({
      usersEnvironment,
      stepUser: 'Alice',
      filename: 'mediaTest.txt',
      content: "I'm a Document"
    })
    await api.userHasCreatedFile({
      usersEnvironment,
      stepUser: 'Alice',
      filename: 'mediaTest.pdf',
      content: "I'm a PDF"
    })
    await api.userHasCreatedFile({
      usersEnvironment,
      stepUser: 'Alice',
      filename: 'mediaTest.mp3',
      content: "I'm a Audio"
    })
    await api.userHasCreatedFile({
      usersEnvironment,
      stepUser: 'Alice',
      filename: 'mediaTest.zip',
      content: "I'm a Archive"
    })
    // And "Alice" searches "mediaTest" using the global search and the "all files" filter and presses enter
    await ui.searchGloballyWithFilter({
      actorsEnvironment,
      stepUser: 'Alice',
      keyword: 'mediaTest',
      filter: 'all files',
      command: 'presses enter'
    })
    // And "Alice" enables the option to search title only
    await ui.userEnablesOptionToSearchTitleOnly({ actorsEnvironment, stepUser: 'Alice' })
    // And "Alice" selects mediaType "Document" from the search result filter chip
    await ui.userSelectsMediaTypeFromSearchResultFilterChip({
      actorsEnvironment,
      stepUser: 'Alice',
      mediaType: 'Document'
    })
    // Then following resources should be displayed in the files list for user "Alice"
    //   | resource      |
    //   | mediaTest.txt |
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'files list',
      stepUser: 'Alice',
      resources: ['mediaTest.txt']
    })
    // And "Alice" clears mediaType filter
    await ui.userClearsFilter({ actorsEnvironment, stepUser: 'Alice', filter: 'mediaType' })
    // When "Alice" selects mediaType "PDF" from the search result filter chip
    await ui.userSelectsMediaTypeFromSearchResultFilterChip({
      actorsEnvironment,
      stepUser: 'Alice',
      mediaType: 'PDF'
    })
    // Then following resources should be displayed in the files list for user "Alice"
    //   | resource      |
    //   | mediaTest.pdf |
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'files list',
      stepUser: 'Alice',
      resources: ['mediaTest.pdf']
    })
    // And "Alice" clears mediaType filter
    await ui.userClearsFilter({ actorsEnvironment, stepUser: 'Alice', filter: 'mediaType' })
    // When "Alice" selects mediaType "Audio" from the search result filter chip
    await ui.userSelectsMediaTypeFromSearchResultFilterChip({
      actorsEnvironment,
      stepUser: 'Alice',
      mediaType: 'Audio'
    })
    // Then following resources should be displayed in the files list for user "Alice"
    //   | resource      |
    //   | mediaTest.mp3 |
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'files list',
      stepUser: 'Alice',
      resources: ['mediaTest.mp3']
    })
    // And "Alice" clears mediaType filter
    await ui.userClearsFilter({ actorsEnvironment, stepUser: 'Alice', filter: 'mediaType' })
    // When "Alice" selects mediaType "Archive" from the search result filter chip
    await ui.userSelectsMediaTypeFromSearchResultFilterChip({
      actorsEnvironment,
      stepUser: 'Alice',
      mediaType: 'Archive'
    })
    // Then following resources should be displayed in the files list for user "Alice"
    //   | resource      |
    //   | mediaTest.zip |
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'files list',
      stepUser: 'Alice',
      resources: ['mediaTest.zip']
    })
    // And "Alice" clears mediaType filter
    await ui.userClearsFilter({ actorsEnvironment, stepUser: 'Alice', filter: 'mediaType' })

    // # multiple choose
    // When "Alice" selects mediaType "Folder" from the search result filter chip
    await ui.userSelectsMediaTypeFromSearchResultFilterChip({
      actorsEnvironment,
      stepUser: 'Alice',
      mediaType: 'Folder'
    })
    // And "Alice" selects mediaType "Image" from the search result filter chip
    await ui.userSelectsMediaTypeFromSearchResultFilterChip({
      actorsEnvironment,
      stepUser: 'Alice',
      mediaType: 'Image'
    })
    // Then following resources should be displayed in the files list for user "Alice"
    //   | resource      |
    //   | mediaTest     |
    //   | mediaTest.jpg |
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'files list',
      stepUser: 'Alice',
      resources: ['mediaTest', 'mediaTest.jpg']
    })
    // But following resources should not be displayed in the files list for user "Alice"
    //   | resource      |
    //   | mediaTest.txt |
    //   | mediaTest.pdf |
    //   | mediaTest.mp3 |
    //   | mediaTest.zip |
    await ui.userShouldNotSeeTheResources({
      actorsEnvironment,
      listType: 'files list',
      stepUser: 'Alice',
      resources: ['mediaTest.txt', 'mediaTest.pdf', 'mediaTest.mp3', 'mediaTest.zip']
    })
    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  })

  test('Search using lastModified filter', async () => {
    // And "Alice" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
    // And "Alice" creates the following folders in personal space using API
    //   | name       |
    //   | mainFolder |
    await api.userHasCreatedFolder({
      usersEnvironment,
      stepUser: 'Alice',
      folderName: 'mainFolder'
    })
    // And "Alice" creates the following files with mtime into personal space using API
    //   | pathToFile               | content             | mtimeDeltaDays |
    //   | mainFolder/mediaTest.pdf | created 29 days ago | -29 days       |
    //   | mainFolder/mediaTest.txt | created 5 days ago  | -5 days        |
    //   | mainFolder/mediaTest.md  | created today       |                |
    await api.userHasCreatedFile({
      usersEnvironment,
      stepUser: 'Alice',
      filename: 'mainFolder/mediaTest.pdf',
      content: 'created 29 days ago',
      mtimeDeltaDays: '-29 days'
    })
    await api.userHasCreatedFile({
      usersEnvironment,
      stepUser: 'Alice',
      filename: 'mainFolder/mediaTest.txt',
      content: 'created 5 days ago',
      mtimeDeltaDays: '-5 days'
    })
    await api.userHasCreatedFile({
      usersEnvironment,
      stepUser: 'Alice',
      filename: 'mainFolder/mediaTest.md',
      content: 'created today'
    })
    // When "Alice" opens folder "mainFolder"
    await ui.openResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'mainFolder'
    })
    // And "Alice" searches "mediaTest" using the global search and the "current folder" filter and presses enter
    await ui.searchGloballyWithFilter({
      actorsEnvironment,
      stepUser: 'Alice',
      keyword: 'mediaTest',
      filter: 'current folder',
      command: 'presses enter'
    })
    // And "Alice" enables the option to search title only
    await ui.userEnablesOptionToSearchTitleOnly({ actorsEnvironment, stepUser: 'Alice' })
    // And "Alice" selects lastModified "last 30 days" from the search result filter chip
    await ui.userSelectsLastModifiedFromSearchResultFilterChip({
      actorsEnvironment,
      stepUser: 'Alice',
      lastModified: 'last 30 days'
    })
    // Then following resources should be displayed in the files list for user "Alice"
    //   | resource                 |
    //   | mainFolder/mediaTest.pdf |
    //   | mainFolder/mediaTest.txt |
    //   | mainFolder/mediaTest.md  |
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'files list',
      stepUser: 'Alice',
      resources: ['mainFolder/mediaTest.pdf', 'mainFolder/mediaTest.txt', 'mainFolder/mediaTest.md']
    })
    // When "Alice" selects lastModified "last 7 days" from the search result filter chip
    await ui.userSelectsLastModifiedFromSearchResultFilterChip({
      actorsEnvironment,
      stepUser: 'Alice',
      lastModified: 'last 7 days'
    })
    // Then following resources should be displayed in the files list for user "Alice"
    //   | resource                 |
    //   | mainFolder/mediaTest.txt |
    //   | mainFolder/mediaTest.md  |
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'files list',
      stepUser: 'Alice',
      resources: ['mainFolder/mediaTest.txt', 'mainFolder/mediaTest.md']
    })
    // But following resources should not be displayed in the files list for user "Alice"
    //   | resource                 |
    //   | mainFolder/mediaTest.pdf |
    await ui.userShouldNotSeeTheResources({
      actorsEnvironment,
      listType: 'files list',
      stepUser: 'Alice',
      resources: ['mainFolder/mediaTest.pdf']
    })
    // When "Alice" selects lastModified "today" from the search result filter chip
    await ui.userSelectsLastModifiedFromSearchResultFilterChip({
      actorsEnvironment,
      stepUser: 'Alice',
      lastModified: 'today'
    })
    // Then following resources should be displayed in the files list for user "Alice"
    //   | resource                |
    //   | mainFolder/mediaTest.md |
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'files list',
      stepUser: 'Alice',
      resources: ['mainFolder/mediaTest.md']
    })
    // But following resources should not be displayed in the files list for user "Alice"
    //   | resource                 |
    //   | mainFolder/mediaTest.pdf |
    //   | mainFolder/mediaTest.txt |
    await ui.userShouldNotSeeTheResources({
      actorsEnvironment,
      listType: 'files list',
      stepUser: 'Alice',
      resources: ['mainFolder/mediaTest.pdf', 'mainFolder/mediaTest.txt']
    })
    // And "Alice" clears lastModified filter
    await ui.userClearsFilter({ actorsEnvironment, stepUser: 'Alice', filter: 'lastModified' })
    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  })
})

import { expect, test } from '@playwright/test'
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
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Alice' })
    await api.userHasBeenCreated({ usersEnvironment, stepUser: 'Admin', userToBeCreated: 'Brian' })

    // And "Admin" assigns following roles to the users using API
    //   | id    | role        |
    //   | Brian | Space Admin |
    await api.userHasAssignRolesToUsers({
      usersEnvironment,
      stepUser: 'Admin',
      targetUserId: 'Brian',
      role: 'Space Admin'
    })

    // And "Alice" uploads the following local file into personal space using API
    //   | localFile                   | to              |
    //   | filesForUpload/textfile.txt | fileToShare.txt |
    await api.uploadFileInPersonalSpace({
      usersEnvironment, 
      stepUser: 'Alice',  
      filesEnvironment,
      resource: 'filesForUpload/textfile.txt', 
      destination: 'fileToShare.txt' 
    })
    
    // And "Alice" adds the following tags for the following resources using API
    //   | resource        | tags      |
    //   | fileToShare.txt | alice tag |
    await api.userHasAddedTagsToResource({
      usersEnvironment,
      stepUser: 'Alice',
      resource: 'fileToShare.txt',
      tags: 'alice tag'
    })

    // And "Alice" shares the following resource using API
    //   | resource        | recipient | type | role     |
    //   | fileToShare.txt | Brian     | user | Can edit |
    await api.userHasSharedResource({
      usersEnvironment,
      stepUser: 'Alice',
      resource: 'fileToShare.txt',
      recipient: 'Brian',
      type: 'user',
      role: 'Can edit',
      resourceType: 'file'
    })

    // And "Brian" creates the following folder in personal space using API
    //   | name       |
    //   | testFolder |
    await api.userHasCreatedFolder({ usersEnvironment, stepUser: 'Brian', folderName: 'testFolder' })

    // And "Brian" uploads the following local file into personal space using API
    //   | localFile                   | to                           |
    //   | filesForUpload/textfile.txt | textfile.txt                 |
    //   | filesForUpload/textfile.txt | fileWithTag.txt              |
    //   | filesForUpload/textfile.txt | withTag.txt                  |
    //   | filesForUpload/textfile.txt | testFolder/innerTextfile.txt |
    await ui.uploadResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Brian',
      resource: 'filesForUpload/textfile.txt',
      to: 'textfile.txt'
    })
    await ui.uploadResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Brian',
      resource: 'filesForUpload/textfile.txt',
      to: 'fileWithTag.txt'
    })
    await ui.uploadResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Brian',
      resource: 'filesForUpload/textfile.txt',
      to: 'withTag.txt'
    })
    await ui.uploadResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Brian',
      resource: 'filesForUpload/textfile.txt',
      to: 'testFolder/innerTextfile.txt'
    })

    // And "Brian" creates the following project spaces using API
    //   | name           | id               |
    //   | FullTextSearch | fulltextsearch.1 |
    await api.userHasCreatedProjectSpace({
      usersEnvironment,
      spacesEnvironment,
      stepUser: 'Brian',
      name: 'FullTextSearch',
      id: 'fulltextsearch.1'
    })

    // And "Brian" creates the following folder in space "FullTextSearch" using API
    //   | name        |
    //   | spaceFolder |
    await api.userHasCreatedFolderInSpace({
      usersEnvironment,
      stepUser: 'Brian',
      spaceName: 'FullTextSearch',
      folder: 'spaceFolder'
    })
    
    // And "Brian" creates the following file in space "FullTextSearch" using API
    //   | name                          | content                   |
    //   | spaceFolder/spaceTextfile.txt | This is test file. Cheers |
    await api.createFileInsideSpaceBySpaceName({
      usersEnvironment,
      stepUser: 'Brian',
      fileName: 'spaceFolder/spaceTextfile.txt',
      space: 'FullTextSearch',
      content: 'This is test file. Cheers'
    })
    
    // And "Brian" adds the following tags for the following resources using API
    //   | resource        | tags  |
    //   | fileWithTag.txt | tag 1 |
    //   | withTag.txt     | tag 1 |
    await api.userHasAddedTagsToResource({
      usersEnvironment,
      stepUser: 'Brian',
      resource: 'fileWithTag.txt',
      tags: 'tag 1'
    })
    await api.userHasAddedTagsToResource({
      usersEnvironment,
      stepUser: 'Brian',
      resource: 'withTag.txt',
      tags: 'tag 1'
    })

    // And "Brian" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })

    // await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })

    // await api.userHasCreatedProjectSpace({
    //   usersEnvironment,
    //   spacesEnvironment,
    //   stepUser: 'Alice',
    //   name: 'team',
    //   id: 'team.1'
    // })

    // await ui.navigateToSpace({ actorsEnvironment, stepUser: 'Alice', space: 'team.1' })

    // await ui.createResource({
    //   actorsEnvironment,
    //   stepUser: 'Alice',
    //   resource: 'folder(WithSymbols:!;_+-&)',
    //   type: 'folder'
    // })

    // await ui.uploadResource({
    //   actorsEnvironment,
    //   filesEnvironment,
    //   stepUser: 'Alice',
    //   resource: "new-'single'quotes.txt",
    //   to: 'folder(WithSymbols:!;_+-&)'
    // })

    // await ui.navigateToPersonalSpacePage({ actorsEnvironment, stepUser: 'Alice' })
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
      filter: 'all files'
    })

    // Then "Brian" should see the message "Search for files" on the search result

    // When "Brian" selects tag "alice tag" from the search result filter chip
    // Then following resources should be displayed in the files list for user "Brian"
    //   | resource        |
    //   | fileToShare.txt |

    // search for project space objects
    // await ui.searchGloballyWithFilter({
    //   actorsEnvironment,
    //   stepUser: 'Alice',
    //   keyword: "-'s",
    //   filter: 'all files'
    // })

    // expect(
    //   await ui.resourceExists({
    //     actorsEnvironment,
    //     listType: 'search list',
    //     stepUser: 'Alice',
    //     resource: "new-'single'quotes.txt"
    //   })
    // ).toBeTruthy()

    // expect(
    //   await ui.resourceExists({
    //     actorsEnvironment,
    //     listType: 'search list',
    //     stepUser: 'Alice',
    //     resource: 'folder(WithSymbols:!;_+-&)'
    //   })
    // ).toBeFalsy()

    // await ui.searchGloballyWithFilter({
    //   actorsEnvironment,
    //   stepUser: 'Alice',
    //   keyword: '!;_+-&)',
    //   filter: 'all files'
    // })

    // expect(
    //   await ui.resourceExists({
    //     actorsEnvironment,
    //     listType: 'search list',
    //     stepUser: 'Alice',
    //     resource: 'folder(WithSymbols:!;_+-&)'
    //   })
    // ).toBeTruthy()

    // expect(
    //   await ui.resourceExists({
    //     actorsEnvironment,
    //     listType: 'search list',
    //     stepUser: 'Alice',
    //     resource: "new-'single'quotes.txt"
    //   })
    // ).toBeFalsy()

    // await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  })
})

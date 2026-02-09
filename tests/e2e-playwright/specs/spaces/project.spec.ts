import { test } from '@playwright/test'
import { config } from '../../../e2e/config.js'
import {
  ActorsEnvironment,
  UsersEnvironment,
  FilesEnvironment,
  LinksEnvironment,
  SpacesEnvironment
} from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'

test.describe('spaces.personal', () => {
  let actorsEnvironment
  const usersEnvironment = new UsersEnvironment()
  const filesEnvironment = new FilesEnvironment()
  const linksEnvironment = new LinksEnvironment()
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
    // Given "Admin" creates following users using API
    //   | id    |
    //   | Alice |
    //   | Brian |
    await api.userHasBeenCreated({
      usersEnvironment,
      stepUser: 'Admin',
      userToBeCreated: 'Alice'
    })
    await api.userHasBeenCreated({
      usersEnvironment,
      stepUser: 'Admin',
      userToBeCreated: 'Brian'
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
  })

  test.afterEach(async () => {
    // clean up users
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
  })

  test('unstructured collection of testable space interactions,', async () => {
    // When "Alice" opens the "files" app
    await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Alice', name: 'files' })
    // And "Alice" navigates to the projects space page
    await ui.navigateToSpacesPage({ actorsEnvironment, stepUser: 'Alice' })
    // And "Alice" creates the following project spaces
    //   | name  | id     |
    //   | team  | team.1 |
    //   | team2 | team.2 |
    await ui.createProjectSpace({
      actorsEnvironment,
      stepUser: 'Alice',
      name: 'team',
      id: 'team.1'
    })
    await ui.createProjectSpace({
      actorsEnvironment,
      stepUser: 'Alice',
      name: 'team2',
      id: 'team.2'
    })

    // team.1
    // And "Alice" navigates to the project space "team.1"
    await ui.navigateToSpace({ actorsEnvironment, stepUser: 'Alice', space: 'team.1' })
    // And "Alice" updates the space "team.1" name to "developer team"
    await ui.userUpdatesSpace({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      key: 'team.1',
      attribute: 'name',
      value: 'developer team'
    })
    // And "Alice" updates the space "team.1" subtitle to "developer team - subtitle"
    await ui.userUpdatesSpace({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      key: 'team.1',
      attribute: 'subtitle',
      value: 'developer team - subtitle'
    })
    // And "Alice" updates the space "team.1" description to "developer team - description"
    await ui.userUpdatesSpace({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      key: 'team.1',
      attribute: 'description',
      value: 'developer team - description'
    })
    // And "Alice" updates the space "team.1" quota to "50"
    await ui.userUpdatesSpace({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      key: 'team.1',
      attribute: 'quota',
      value: '50'
    })
    // And "Alice" updates the space "team.1" image to "testavatar.png"
    await ui.userUpdatesSpace({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      key: 'team.1',
      attribute: 'image',
      value: 'testavatar.png'
    })

    // shared examples
    // And "Alice" creates the following resources
    //   | resource         | type   |
    //   | folderPublic     | folder |
    //   | folder_to_shared | folder |
    await ui.createResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'folderPublic',
      type: 'folder'
    })
    await ui.createResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'folder_to_shared',
      type: 'folder'
    })
    // And "Alice" uploads the following resources
    //   | resource  | to               |
    //   | lorem.txt | folderPublic     |
    //   | lorem.txt | folder_to_shared |
    await ui.uploadResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      resource: 'lorem.txt',
      to: 'spaceFolder'
    })
    await ui.uploadResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      resource: 'lorem.txt',
      to: 'folder_to_shared'
    })
    // And "Alice" creates a public link of following resource using the sidebar panel
    //   | resource     | role             | password |
    //   | folderPublic | Secret File Drop | %public% |
    await ui.createPublicLink({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'folderPublic',
      role: 'Secret File Drop',
      password: '%public%'
    })
    // And "Alice" renames the most recently created public link of resource "folderPublic" to "team.1"
    await ui.userRenamesMostRecentlyCreatedPublicLinkOfResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'folderPublic',
      newName: 'team.1'
    })
    // And "Alice" sets the expiration date of the public link named "team.1" of resource "folderPublic" to "+5 days"
    await ui.userSetsExperationDateOfPublicLink({
      actorsEnvironment,
      stepUser: 'Alice',
      linkName: 'team.1',
      resource: 'folderPublic',
      expireDate: '+5 days'
    })

    // borrowed from share.feature
    // When "Alice" shares the following resource using the sidebar panel
    //   | resource         | recipient | type | role                   | resourceType |
    //   | folder_to_shared | Brian     | user | Can edit with trashbin | folder       |
    await ui.shareResource({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      actionType: 'SIDEBAR_PANEL',
      resource: 'folder_to_shared',
      recipient: 'Brian',
      type: 'user',
      role: 'Can edit with trashbin',
      resourceType: 'folder'
    })

    // team.2
    // And "Alice" navigates to the project space "team.2"
    await ui.navigateToSpace({ actorsEnvironment, stepUser: 'Alice', space: 'team.2' })
    // And "Alice" updates the space "team.2" name to "management team"
    await ui.userUpdatesSpace({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      key: 'team.2',
      attribute: 'name',
      value: 'management team'
    })
    // And "Alice" updates the space "team.2" subtitle to "management team - subtitle"
    await ui.userUpdatesSpace({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      key: 'team.2',
      attribute: 'subtitle',
      value: 'management team - subtitle'
    })
    // And "Alice" updates the space "team.2" description to "management team - description"
    await ui.userUpdatesSpace({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      key: 'team.2',
      attribute: 'description',
      value: 'management team - description'
    })
    // And "Alice" updates the space "team.2" quota to "500"
    await ui.userUpdatesSpace({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      key: 'team.2',
      attribute: 'quota',
      value: '500'
    })
    // And "Alice" updates the space "team.2" image to "sampleGif.gif"
    await ui.userUpdatesSpace({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      key: 'team.2',
      attribute: 'image',
      value: 'sampleGif.gif'
    })

    // And "Alice" creates the following resources
    //   | resource     | type   |
    //   | folderPublic | folder |
    await ui.createResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'folderPublic',
      type: 'folder'
    })
    // And "Alice" uploads the following resources
    //   | resource  | to           |
    //   | lorem.txt | folderPublic |
    await ui.uploadResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      resource: 'lorem.txt',
      to: 'folderPublic'
    })
    // And "Alice" creates a public link of following resource using the sidebar panel
    //   | resource     | password |
    //   | folderPublic | %public% |
    await ui.createPublicLink({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'folderPublic',
      password: '%public%'
    })
    // And "Alice" renames the most recently created public link of resource "folderPublic" to "team.2"
    await ui.userRenamesMostRecentlyCreatedPublicLinkOfResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'folderPublic',
      newName: 'team.2'
    })
    // And "Alice" edits the public link named "team.2" of resource "folderPublic" changing role to "Secret File Drop"
    await ui.userEditsPublicLinkOfResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'folderPublic',
      linkName: 'team.2',
      role: 'Secret File Drop'
    })
    // And "Alice" sets the expiration date of the public link named "team.2" of resource "folderPublic" to "+5 days"
    await ui.userSetsExperationDateOfPublicLink({
      actorsEnvironment,
      stepUser: 'Alice',
      linkName: 'team.2',
      resource: 'folderPublic',
      expireDate: '+5 days'
    })
    // And "Alice" changes the password of the public link named "team.2" of resource "folderPublic" to "new-strongPass1"
    await ui.userChangesThePasswordOfPublicLink({
      actorsEnvironment,
      stepUser: 'Alice',
      linkName: 'team.2',
      resource: 'folderPublic',
      newPassword: 'new-strongPass1'
    })

    // borrowed from link.feature, all existing resource actions can be reused
    // When "Anonymous" opens the public link "team.1"
    await ui.openPublicLink({
      actorsEnvironment,
      linksEnvironment,
      stepUser: 'Anonymous',
      name: 'team.1'
    })
    // And "Anonymous" unlocks the public link with password "%public%"
    await ui.userUnlocksPublicLink({
      actorsEnvironment,
      password: '%public%',
      stepUser: 'Anonymous'
    })
    // And "Anonymous" drop uploads following resources
    //   | resource     |
    //   | textfile.txt |
    await ui.userDropsResources({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Anonymous',
      resource: 'textfile.txt'
    })

    // borrowed from share.feature
    // And "Brian" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })
    // And "Brian" opens the "files" app
    await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Brian', name: 'files' })
    // And "Brian" navigates to the shared with me page
    await ui.userNavigatesToSharedWithMePage({ actorsEnvironment, stepUser: 'Brian' })
    // And "Brian" renames the following resource
    //   | resource                   | as            |
    //   | folder_to_shared/lorem.txt | lorem_new.txt |
    await ui.userRenamesResource({
      actorsEnvironment,
      stepUser: 'Brian',
      resource: 'folder_to_shared/lorem.txt',
      newName: 'lorem_new.txt'
    })
    // And "Brian" uploads the following resource
    //   | resource   | to               |
    //   | simple.pdf | folder_to_shared |
    await ui.uploadResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      resource: 'simple.pdf',
      to: 'folder_to_shared'
    })
    // And "Alice" navigates to the project space "team.1"
    await ui.navigateToSpace({ actorsEnvironment, stepUser: 'Alice', space: 'team.1' })
    // And "Alice" updates the space "team.1" image to "testavatar.jpeg"
    await ui.userUpdatesSpace({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      key: 'team.2',
      attribute: 'image',
      value: 'testavatar.jpeg'
    })
    // And "Alice" uploads the following resource
    //   | resource          | to               | option  |
    //   | PARENT/simple.pdf | folder_to_shared | replace |
    await ui.uploadResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      resource: 'PARENT/simple.pdf',
      to: 'folder_to_shared',
      option: 'replace'
    })
    // And "Brian" should not see the version panel for the file
    //   | resource   | to               |
    //   | simple.pdf | folder_to_shared |

    // When "Alice" deletes the following resources using the sidebar panel
    //   | resource         | from             |
    //   | lorem_new.txt    | folder_to_shared |
    //   | folder_to_shared |                  |
    await ui.deleteResource({
      actorsEnvironment,
      stepUser: 'Alice',
      file: 'lorem_new.txt',
      actionType: 'sidebar panel',
      parentFolder: 'folder_to_shared'
    })
    await ui.deleteResource({
      actorsEnvironment,
      stepUser: 'Alice',
      file: 'folder_to_shared',
      actionType: 'sidebar panel'
    })
    // And "Brian" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Brian' })
    // alice is done
    // When "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })

    // borrowed from link.feature, all existing resource actions can be reused
    // When "Anonymous" opens the public link "team.2"
    await ui.openPublicLink({
      actorsEnvironment,
      linksEnvironment,
      stepUser: 'Anonymous',
      name: 'team.2'
    })
    // And "Anonymous" unlocks the public link with password "new-strongPass1"
    await ui.userUnlocksPublicLink({
      actorsEnvironment,
      password: 'new-strongPass1',
      stepUser: 'Anonymous'
    })
    // And "Anonymous" drop uploads following resources
    //   | resource     |
    //   | textfile.txt |
    await ui.userDropsResources({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Anonymous',
      resource: 'textfile.txt'
    })
  })

  test('members of the space can control the versions of the files', async () => {
    // And "Alice" creates the following project space using API
    //   | name | id     |
    //   | team | team.1 |
    await api.userHasCreatedProjectSpace({
      usersEnvironment,
      spacesEnvironment,
      stepUser: 'Alice',
      name: 'sales',
      id: 'sales'
    })
    // And "Alice" navigates to the project space "team.1"
    await ui.navigateToSpace({ actorsEnvironment, stepUser: 'Alice', space: 'team.1' })
    // And "Alice" creates the following resources
    //   | resource            | type    | content             |
    //   | parent/textfile.txt | txtFile | some random content |
    await ui.createResource({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'parent/textfile.txt',
      type: 'txtFile',
      content: 'some random content'
    })
    // When "Alice" uploads the following resources
    //   | resource     | to     | option  |
    //   | textfile.txt | parent | replace |
    await ui.uploadResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      resource: 'textfile.txt',
      to: 'parent',
      option: 'replace'
    })
    // And "Alice" adds following users to the project space
    //   | user  | role                                | kind |
    //   | Carol | Can view                            | user |
    //   | Brian | Can edit with versions and trashbin | user |
    await ui.addMembersToSpace({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      sharee: 'Carol',
      role: 'Can view',
      kind: 'user'
    })
    await ui.addMembersToSpace({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice',
      sharee: 'Brian',
      role: 'Can edit with versions and trashbin',
      kind: 'user'
    })
    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Admin' })
    // When "Carol" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Carol' })
    // And "Carol" navigates to the project space "team.1"
    await ui.navigateToSpace({ actorsEnvironment, stepUser: 'Carol', space: 'team.1' })
    // And "Carol" should not see the version panel for the file
    //   | resource     | to     |
    //   | textfile.txt | parent |
    await ui.userShouldNotSeeVersionPanelForFiles({actorsEnvironment,filesEnvironment,stepUser:'Carol',resource:'textfile.txt',to:'parent'})
    // And "Carol" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Carol' })

    // When "Brian" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Caron' })
    // And "Brian" navigates to the project space "team.1"
    await ui.navigateToSpace({ actorsEnvironment, stepUser: 'Brian', space: 'team.1' })
    // And "Brian" downloads old version of the following resource
    //   | resource     | to     |
    //   | textfile.txt | parent |
    // And "Brian" restores following resources version
    //   | resource     | to     | version | openDetailsPanel |
    //   | textfile.txt | parent | 1       | true             |
    // And "Brian" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Carol' })
  })
})

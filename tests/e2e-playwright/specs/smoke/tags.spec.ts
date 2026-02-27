import { test } from '@playwright/test'
import { config } from '../../../e2e/config.js'
import {
  ActorsEnvironment,
  UsersEnvironment,
  LinksEnvironment,
  FilesEnvironment
} from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'

test.describe('Users can use web to organize tags', () => {
  let actorsEnvironment
  const usersEnvironment = new UsersEnvironment()
  const linksEnvironment = new LinksEnvironment()
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

    // Given "Alice" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })
  })

  test.afterEach(async () => {
    // clean up users
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Brian' })
  })

  test('Tag management', { tag: '@predefined-users' }, async () => {
    // When "Alice" creates the following files into personal space using API
    //   | pathToFile | content     |
    //   | lorem.txt  | lorem ipsum |
    await api.userHasCreatedFile({
      usersEnvironment,
      stepUser: 'Alice',
      filename: 'lorem.txt',
      content: 'lorem ipsum'
    })
    // And "Alice" adds the following tags for the following resources using the sidebar panel
    //   | resource  | tags         |
    //   | lorem.txt | tag 1, tag 2 |
    await ui.userAddsFollowingTags({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'lorem.txt',
      tags: ['tag 1', 'tag 2']
    })
    // Then the following resources should contain the following tags in the files list for user "Alice"
    //   | resource  | tags         |
    //   | lorem.txt | tag 1, tag 2 |
    await ui.resourceShouldContainTagsInFileList({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'lorem.txt',
      tags: ['tag 1', 'tags 2']
    })
    // Then the following resources should contain the following tags in the details panel for user "Alice"
    //   | resource  | tags         |
    //   | lorem.txt | tag 1, tag 2 |
    await ui.resourceShouldContainTagsInDetailList({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'lorem.txt',
      tags: ['tag 1', 'tag 2']
    })
    // When "Alice" removes the following tags for the following resources using the sidebar panel
    //   | resource  | tags  |
    //   | lorem.txt | tag 1 |
    await ui.userRemovesTagsFromResourcesUsingSideBar({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'lorem.txt',
      tags: ['tag 1']
    })
    // Then the following resources should contain the following tags in the files list for user "Alice"
    //   | resource  | tags  |
    //   | lorem.txt | tag 2 |
    await ui.resourceShouldContainTagsInFileList({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'lorem.txt',
      tags: ['tags 2']
    })
    // Then the following resources should contain the following tags in the details panel for user "Alice"
    //   | resource  | tags  |
    //   | lorem.txt | tag 2 |
    await ui.resourceShouldContainTagsInDetailList({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'lorem.txt',
      tags: ['tag 2']
    })
    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Brian' })
  })

  test('Long tag name', async () => {
    // And "Alice" creates the following files into personal space using API
    //   | pathToFile | content     |
    //   | lorem.txt  | lorem ipsum |
    await api.userHasCreatedFile({
      usersEnvironment,
      stepUser: 'Alice',
      filename: 'lorem.txt',
      content: 'lorem ipsum'
    })
    // When "Alice" tries to add the following tag for the following resources using the sidebar panel
    //   | resource  | tags                                                                                                       |
    //   | lorem.txt | Loremipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore |
    await ui.userTriesToAddTagUsingSidebarPanel({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'lorem.txt',
      tags: [
        'Loremipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore'
      ]
    })
    // Then "Alice" should see the following tag validation message:
    //   """
    //   Tags must not be longer than 100 characters
    //   """
    await ui.userShouldSeeFollowingTagValidationMessages({
      actorsEnvironment,
      stepUser: 'Alice',
      message: 'Tags must not be longer than 100 characters'
    })
    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Brian' })
  })

  test('Tag search', { tag: '@predefined-users' }, async () => {
    // When "Alice" creates the following files into personal space using API
    //   | pathToFile   | content     |
    //   | lorem.txt    | lorem ipsum |
    //   | textfile.txt | test file   |
    await api.userHasCreatedFile({
      usersEnvironment,
      stepUser: 'Alice',
      filename: 'lorem.txt',
      content: 'lorem ipsum'
    })
    await api.userHasCreatedFile({
      usersEnvironment,
      stepUser: 'Alice',
      filename: 'textfile.txt',
      content: 'test file'
    })
    // And "Alice" adds the following tags for the following resources using the sidebar panel
    //   | resource  | tags       |
    //   | lorem.txt | tag1, tag2 |
    await ui.userAddsFollowingTags({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'lorem.txt',
      tags: ['tag 1', 'tag 2']
    })
    // And "Alice" clicks the tag "tag1" on the resource "lorem.txt"
    // Then the following resources should contain the following tags in the files list for user "Alice"
    //   | resource  | tags |
    //   | lorem.txt | tag1 |
    await ui.resourceShouldContainTagsInFileList({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'lorem.txt',
      tags: ['tag1']
    })
    // Then following resources should not be displayed in the files list for user "Alice"
    //   | resource     |
    //   | textfile.txt |
    await ui.userShouldNotSeeTheResources({
      actorsEnvironment,
      listType: 'files list',
      stepUser: 'Alice',
      resources: ['textfile.txt']
    })
    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Brian' })
  })

  test('Tags in shared resources', { tag: '@predefined-users' }, async () => {
    // And "Brian" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })
    // And "Alice" creates the following folders in personal space using API
    //   | name             |
    //   | folder_to_shared |
    await api.userHasCreatedFolders({
      usersEnvironment,
      stepUser: 'Alice',
      folderNames: ['folder_to_shared']
    })
    // And "Alice" creates the following files into personal space using API
    //   | pathToFile                 | content     |
    //   | folder_to_shared/lorem.txt | lorem ipsum |
    await api.userHasCreatedFile({
      usersEnvironment,
      stepUser: 'Alice',
      filename: 'folder_to_shared/lorem.txt',
      content: 'lorem ipsum'
    })
    // And "Alice" adds the following tags for the following resources using the sidebar panel
    //   | resource                   | tags         |
    //   | folder_to_shared/lorem.txt | tag 1, tag 2 |
    await ui.userAddsFollowingTags({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'folder_to_shared/lorem.txt',
      tags: ['tag 1', 'tag 2']
    })
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
    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Brian' })
  })
})

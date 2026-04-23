import { test } from '../../support/test'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'
import { applications, actions } from '../../support/constants'

test.describe('spaces public link', () => {
  test.beforeEach(async ({ world }) => {
    await api.usersHaveBeenCreated({ world, stepUser: 'Admin', users: ['Alice'] })
  })

  test('public link for space', async ({ world }) => {
    await api.usersHaveBeenCreated({ world, stepUser: 'Admin', users: ['Brian', 'Carol', 'David'] })

    await api.userHasAssignedRolesToUsers({
      world,
      stepUser: 'Admin',
      users: [{ id: 'Alice', role: 'Space Admin' }]
    })

    await ui.userLogsIn({ world, stepUser: 'Alice' })

    await api.userHasCreatedProjectSpaces({
      world,
      stepUser: 'Alice',
      spaces: [{ name: 'team', id: 'team.1' }]
    })

    await api.userHasCreatedFoldersInSpace({
      world,
      stepUser: 'Alice',
      spaceName: 'team',
      folders: ['spaceFolder/subFolder']
    })

    await api.userHasCreatedFilesInsideSpace({
      world,
      stepUser: 'Alice',
      files: [
        { name: 'spaceFolder/shareToBrian.txt', space: 'team', content: 'some text' },
        { name: 'spaceFolder/subFolder/shareToBrian.md', space: 'team', content: 'readme' }
      ]
    })

    await api.userHasAddedMembersToSpace({
      world,
      stepUser: 'Alice',
      space: 'team',
      sharee: [
        { user: 'Brian', role: 'Can edit with versions and trashbin', shareType: 'user' },
        { user: 'Carol', role: 'Can view', shareType: 'user' },
        { user: 'David', role: 'Can manage', shareType: 'user' }
      ]
    })

    await ui.userNavigatesToSpace({ world, stepUser: 'Alice', space: 'team.1' })

    await ui.userUploadsResourcesViaDragNDrop({
      world,
      stepUser: 'Alice',
      resourceNames: ['simple.pdf', 'testavatar.jpg']
    })

    await ui.userCreatesPublicLinkOfSpaceWithPassword({
      world,
      stepUser: 'Alice',
      password: '%public%'
    })

    await ui.userRenamesTheMostRecentlyCreatedPublicLinkOfSpace({
      world,
      stepUser: 'Alice',
      newName: 'spaceLink'
    })

    await ui.userCreatesPublicLink({
      world,
      stepUser: 'Alice',
      resource: 'spaceFolder',
      password: '%public%'
    })

    await ui.userRenamesMostRecentlyCreatedPublicLinkOfResource({
      world,
      stepUser: 'Alice',
      resource: 'spaceFolder',
      newName: 'folderLink'
    })

    await ui.userCreatesPublicLink({
      world,
      stepUser: 'Alice',
      resource: 'spaceFolder/shareToBrian.txt',
      password: '%public%'
    })

    await ui.userRenamesMostRecentlyCreatedPublicLinkOfResource({
      world,
      stepUser: 'Alice',
      resource: 'spaceFolder/shareToBrian.txt',
      newName: 'textLink'
    })

    await ui.userCreatesPublicLink({
      world,
      stepUser: 'Alice',
      resource: 'spaceFolder/subFolder/shareToBrian.md',
      password: '%public%'
    })

    await ui.userRenamesMostRecentlyCreatedPublicLinkOfResource({
      world,
      stepUser: 'Alice',
      resource: 'spaceFolder/subFolder/shareToBrian.md',
      newName: 'markdownLink'
    })

    await ui.userCreatesPublicLink({
      world,
      stepUser: 'Alice',
      resource: 'simple.pdf',
      password: '%public%'
    })

    await ui.userRenamesMostRecentlyCreatedPublicLinkOfResource({
      world,
      stepUser: 'Alice',
      resource: 'simple.pdf',
      newName: 'pdfLink'
    })

    await ui.userCreatesPublicLink({
      world,
      stepUser: 'Alice',
      resource: 'testavatar.jpg',
      password: '%public%'
    })

    await ui.userRenamesMostRecentlyCreatedPublicLinkOfResource({
      world,
      stepUser: 'Alice',
      resource: 'testavatar.jpg',
      newName: 'imageLink'
    })

    await ui.userLogsOut({ world, stepUser: 'Alice' })

    await ui.userLogsIn({ world, stepUser: 'Brian' })

    await ui.userOpensPublicLink({
      world,
      stepUser: 'Brian',
      name: 'spaceLink'
    })

    await ui.userUnlocksPublicLink({
      world,
      stepUser: 'Brian',
      password: '%public%'
    })

    await ui.userShouldNotBeAbleToEditThePublicLink({
      world,
      stepUser: 'Brian',
      linkName: 'spaceLink'
    })

    await ui.userShouldNotBeAbleToEditThePublicLink({
      world,
      stepUser: 'Brian',
      linkName: 'folderLink'
    })

    await ui.userOpensPublicLink({
      world,
      stepUser: 'Brian',
      name: 'textLink'
    })

    await ui.userUnlocksPublicLink({
      world,
      stepUser: 'Brian',
      password: '%public%'
    })

    await ui.userIsInFileViewer({
      world,
      stepUser: 'Brian',
      fileViewerType: applications.textEditor
    })

    await ui.userClosesFileViewer({
      world,
      stepUser: 'Brian'
    })

    await ui.userOpensPublicLink({
      world,
      stepUser: 'Brian',
      name: 'markdownLink'
    })

    await ui.userUnlocksPublicLink({
      world,
      stepUser: 'Brian',
      password: '%public%'
    })

    await ui.userIsInFileViewer({
      world,
      stepUser: 'Brian',
      fileViewerType: applications.textEditor
    })

    await ui.userClosesFileViewer({
      world,
      stepUser: 'Brian'
    })

    await ui.userLogsOut({ world, stepUser: 'Brian' })

    await ui.userLogsIn({ world, stepUser: 'Carol' })

    await ui.userOpensPublicLink({
      world,
      stepUser: 'Carol',
      name: 'spaceLink'
    })

    await ui.userUnlocksPublicLink({
      world,
      stepUser: 'Carol',
      password: '%public%'
    })

    await ui.userShouldNotBeAbleToEditThePublicLink({
      world,
      stepUser: 'Carol',
      linkName: 'spaceLink'
    })

    await ui.userShouldNotBeAbleToEditThePublicLink({
      world,
      stepUser: 'Carol',
      linkName: 'folderLink'
    })

    await ui.userOpensPublicLink({
      world,
      stepUser: 'Carol',
      name: 'folderLink'
    })

    await ui.userUnlocksPublicLink({
      world,
      stepUser: 'Carol',
      password: '%public%'
    })

    await ui.userShouldNotBeAbleToEditResource({
      world,
      stepUser: 'Carol',
      resource: 'subFolder'
    })

    await ui.userOpensPublicLink({
      world,
      stepUser: 'Carol',
      name: 'pdfLink'
    })

    await ui.userUnlocksPublicLink({
      world,
      stepUser: 'Carol',
      password: '%public%'
    })

    await ui.userIsInFileViewer({
      world,
      stepUser: 'Carol',
      fileViewerType: applications.pdfViewer
    })

    await ui.userClosesFileViewer({
      world,
      stepUser: 'Carol'
    })

    await ui.userLogsOut({ world, stepUser: 'Carol' })

    await ui.userLogsIn({ world, stepUser: 'David' })

    await ui.userOpensPublicLink({
      world,
      stepUser: 'David',
      name: 'spaceLink'
    })

    await ui.userUnlocksPublicLink({
      world,
      stepUser: 'David',
      password: '%public%'
    })

    await ui.userEditsThePublicLinkOfSpaceChangingRole({
      world,
      stepUser: 'David',
      linkName: 'spaceLink',
      role: 'Can edit'
    })

    await ui.userChangesRoleOfPublicLinkOfResource({
      world,
      stepUser: 'David',
      resource: 'spaceFolder',
      linkName: 'folderLink',
      newRole: 'Can edit'
    })

    await ui.userOpensPublicLink({
      world,
      stepUser: 'David',
      name: 'imageLink'
    })

    await ui.userUnlocksPublicLink({
      world,
      stepUser: 'David',
      password: '%public%'
    })

    await ui.userIsInFileViewer({
      world,
      stepUser: 'David',
      fileViewerType: applications.mediaViewer
    })

    await ui.userClosesFileViewer({
      world,
      stepUser: 'David'
    })

    await ui.userLogsOut({ world, stepUser: 'David' })
  })

  test('crud operation to public link for space', async ({ world }) => {
    await api.userHasAssignedRolesToUsers({
      world,
      stepUser: 'Admin',
      users: [{ id: 'Alice', role: 'Space Admin' }]
    })

    await ui.userLogsIn({ world, stepUser: 'Alice' })

    await api.userHasCreatedProjectSpaces({
      world,
      stepUser: 'Alice',
      spaces: [{ name: 'team', id: 'team.1' }]
    })

    await api.userHasCreatedFilesInsideSpace({
      world,
      stepUser: 'Alice',
      files: [{ name: 'example.txt', space: 'team', content: 'some text' }]
    })

    await ui.userNavigatesToSpace({ world, stepUser: 'Alice', space: 'team.1' })

    await ui.userCreatesPublicLinkOfSpaceWithPassword({
      world,
      stepUser: 'Alice',
      password: '%public%'
    })

    await ui.userRenamesTheMostRecentlyCreatedPublicLinkOfSpace({
      world,
      stepUser: 'Alice',
      newName: 'spaceLink'
    })

    await ui.userEditsThePublicLinkOfSpaceChangingRole({
      world,
      stepUser: 'Alice',
      linkName: 'spaceLink',
      role: 'Can edit'
    })

    await ui.userLogsOut({ world, stepUser: 'Alice' })

    await ui.userOpensPublicLink({
      world,
      stepUser: 'Anonymous',
      name: 'spaceLink'
    })

    await ui.userUnlocksPublicLink({
      world,
      stepUser: 'Anonymous',
      password: '%public%'
    })

    await ui.userDownloadsThePublicLinkResources({
      world,
      stepUser: 'Anonymous',
      actionType: actions.sideBarPanel,
      resources: [{ resource: 'example.txt', type: 'file' }]
    })

    await ui.userUploadsResourcesInPublicLink({
      world,
      stepUser: 'Anonymous',
      resources: [{ name: 'new-lorem.txt' }]
    })

    await ui.userRenamesPublicLinkResources({
      world,
      stepUser: 'Anonymous',
      resources: [{ resource: 'example.txt', newName: 'renamed.txt' }]
    })

    await ui.userEditsResources({
      world,
      stepUser: 'Anonymous',
      resources: [{ name: 'renamed.txt', content: 'new content' }]
    })

    await ui.userDeletesResources({
      world,
      stepUser: 'Anonymous',
      actionType: actions.sideBarPanel,
      resources: [{ name: 'renamed.txt' }, { name: 'new-lorem.txt' }]
    })
  })
})

import { test } from '../../support/test'
import { config } from '../../../e2e/config'
import {
  ActorsEnvironment,
  UsersEnvironment,
  FilesEnvironment
} from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken'
import * as api from '../../steps/api/api'
import * as ui from '../../steps/ui/index'

test.describe('federation management', async () => {
  let actorsEnvironment: ActorsEnvironment
  const usersEnvironment = new UsersEnvironment()
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
  })

  test('user creates a federated share', { tag: '@ocm' }, async () => {
    // Given using "LOCAL" server
    await ui.useServer({
      server: 'LOCAL'
    })

    // And "Admin" creates following user using API
    //   | id    |
    //   | Alice |
    await api.usersHasBeenCreated({
      usersEnvironment,
      stepUser: 'Admin',
      users: ['Alice']
    })

    // And "Alice" creates the following folders in personal space using API
    //   | name         |
    //   | folderPublic |
    await api.userHasCreatedFolders({
      usersEnvironment,
      stepUser: 'Alice',
      folderNames: ['folderPublic']
    })

    // And "Alice" uploads the following local file into personal space using API
    //   | localFile                     | to                      |
    //   | filesForUpload/simple.pdf     | folderPublic/simple.pdf |
    //   | filesForUpload/testavatar.jpg | testavatar.jpg          |
    //   | filesForUpload/sampleGif.gif  | sampleGif.gif           |
    await api.userHasUploadedFilesInPersonalSpace({
      usersEnvironment,
      stepUser: 'Alice',
      filesEnvironment,
      filesToUpload: [
        { localFile: 'filesForUpload/simple.pdf', to: 'folderPublic/simple.gif' },
        { localFile: 'filesForUpload/testavatar.jpg', to: 'testavatar.jpg' },
        { localFile: 'filesForUpload/sampleGif.gif', to: 'sampleGif.gif' }
      ]
    })

    // And "Alice" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })

    // And "Alice" opens the "open-cloud-mesh" app
    await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Alice', name: 'open-cloud-mesh' })

    // And "Alice" generates invitation token for the federation share
    await ui.userGeneratesInvitationTokenForTheFederationShare({
      actorsEnvironment,
      usersEnvironment,
      stepUser: 'Alice'
    })

    // Given using "FEDERATED" server
    await ui.useServer({
      server: 'FEDERATED'
    })
    // await setAccessAndRefreshToken(usersEnvironment)

    // And "Admin" creates following user using API
    //   | id    |
    //   | Brian |
    await api.usersHasBeenCreated({
      usersEnvironment,
      stepUser: 'Admin',
      users: ['Brian']
    })

    // And "Brian" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Brian' })

    // And "Brian" opens the "open-cloud-mesh" app
    await ui.userOpensApplication({ actorsEnvironment, stepUser: 'Brian', name: 'open-cloud-mesh' })

    // When "Brian" accepts federated share invitation by local user "Alice"
    await ui.userAcceptsFederatedShareInvitationByLocalUser({
      actorsEnvironment,
      stepUser: 'Brian',
      sharer: 'Alice'
    })

    // Then "Brian" should see the following federated connections:
    //   | user                     | email              |
    //   | %user_alice_displayName% | %user_alice_email% |
    await ui.userShouldSeeTheFederatedConnections({
      actorsEnvironment,
      stepUser: 'Brian',
      federation: [{ user: '%user_alice_displayName%', email: '%user_alice_email%' }]
    })
  })
})

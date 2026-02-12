import { test } from '@playwright/test'
import { config } from './../../../e2e/config.js'
import {
  ActorsEnvironment,
  UsersEnvironment,
  FilesEnvironment
} from '../../../e2e/support/environment'
import { setAccessAndRefreshToken } from '../../helpers/setAccessAndRefreshToken'
import * as ui from '../../steps/ui/index'
import * as api from '../../steps/api/api'
import { userCreatesAFileOfSizeInTempUploadDir } from '../../steps/runtimeFs'

test.describe('Upload large resources', { tag: '@predefined-users' }, () => {
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

    // Given "Admin" creates following user using API
    // | id    |
    // | Alice |
    await api.usersHasBeenCreated({ usersEnvironment, stepUser: 'Admin', users: ['Alice'] })
  })

  test.afterEach(async () => {
    await api.deleteUser({ usersEnvironment, stepUser: 'Admin', targetUser: 'Alice' })
  })

  test('Upload large resources in personal space', async () => {
    // Given the user creates a file "largefile.txt" of "1GB" size in the temp upload directory
    await userCreatesAFileOfSizeInTempUploadDir({ fileName: 'largefile.txt', fileSize: '1GB' })

    // Given "Alice" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })

    // When "Alice" starts uploading the following large resources from the temp upload directory
    // | resource      |
    // | largefile.txt |
    await ui.userStartsUploadingFileFromTheTempUploadDir({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      file: 'largefile.txt'
    })

    // When "Alice" pauses the file upload
    await ui.userPausesUpload({ actorsEnvironment, stepUser: 'Alice' })

    // When "Alice" cancels the file upload
    await ui.userCancelsUpload({ actorsEnvironment, stepUser: 'Alice' })

    // Then following resources should not be displayed in the files list for user "Alice"
    // | resource      |
    // | largefile.txt |
    await ui.userShouldNotSeeTheResources({
      actorsEnvironment,
      listType: 'files list',
      stepUser: 'Alice',
      resources: ['largefile.txt']
    })

    // When "Alice" starts uploading the following large resources from the temp upload directory
    // | resource      |
    // | largefile.txt |
    await ui.userStartsUploadingFileFromTheTempUploadDir({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      file: 'largefile.txt'
    })

    // When "Alice" pauses the file upload
    await ui.userPausesUpload({ actorsEnvironment, stepUser: 'Alice' })

    // When "Alice" resumes the file upload
    await ui.userResumesUpload({ actorsEnvironment, stepUser: 'Alice' })

    // Then following resources should be displayed in the files list for user "Alice"
    // | resource      |
    // | largefile.txt |
    await ui.userShouldSeeTheResources({
      actorsEnvironment,
      listType: 'files list',
      stepUser: 'Alice',
      resources: ['largefile.txt']
    })

    // When "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  })
})

import { test } from '../../support/test'
import * as ui from '../../steps/ui/index'
import * as api from '../../steps/api/api'
import { userCreatesAFileOfSizeInTempUploadDir } from '../../steps/runtimeFs'

test.describe('Upload large resources', { tag: '@predefined-users' }, () => {
  test.beforeEach(async ({ world }) => {
    // Given "Admin" creates following user using API
    // | id    |
    // | Alice |
    await api.usersHaveBeenCreated({ world, stepUser: 'Admin', users: ['Alice'] })
  })

  test('Upload large resources in personal space', async ({ world }) => {
    // Given the user creates a file "largefile.txt" of "1GB" size in the temp upload directory
    await userCreatesAFileOfSizeInTempUploadDir({ fileName: 'largefile.txt', fileSize: '1GB' })

    // Given "Alice" logs in
    await ui.userLogsIn({ world, stepUser: 'Alice' })

    // When "Alice" starts uploading the following large resources from the temp upload directory
    // | resource      |
    // | largefile.txt |
    await ui.userStartsUploadingFileFromTheTempUploadDir({
      world,
      stepUser: 'Alice',
      file: 'largefile.txt'
    })

    // When "Alice" pauses the file upload
    await ui.userPausesUpload({ world, stepUser: 'Alice' })

    // When "Alice" cancels the file upload
    await ui.userCancelsUpload({ world, stepUser: 'Alice' })

    // Then following resources should not be displayed in the files list for user "Alice"
    // | resource      |
    // | largefile.txt |
    await ui.userShouldNotSeeTheResources({
      world,
      listType: displayedResources.filesList,
      stepUser: 'Alice',
      resources: ['largefile.txt']
    })

    // When "Alice" starts uploading the following large resources from the temp upload directory
    // | resource      |
    // | largefile.txt |
    await ui.userStartsUploadingFileFromTheTempUploadDir({
      world,
      stepUser: 'Alice',
      file: 'largefile.txt'
    })

    // When "Alice" pauses the file upload
    await ui.userPausesUpload({ world, stepUser: 'Alice' })

    // When "Alice" resumes the file upload
    await ui.userResumesUpload({ world, stepUser: 'Alice' })

    // Then following resources should be displayed in the files list for user "Alice"
    // | resource      |
    // | largefile.txt |
    await ui.userShouldSeeResources({
      world,
      listType: displayedResources.filesList,
      stepUser: 'Alice',
      resources: ['largefile.txt']
    })

    // When "Alice" logs out
    await ui.userLogsOut({ world, stepUser: 'Alice' })
  })
})

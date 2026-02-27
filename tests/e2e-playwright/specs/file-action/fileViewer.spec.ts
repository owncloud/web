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
import { applications } from '../../support/constants.js'

test.describe('Different file viewers', { tag: '@predefined-users' }, () => {
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

  test('file viewers', async () => {
    // Given "Admin" creates following user using API
    //   | id    |
    //   | Alice |
    await api.usersHasBeenCreated({
      usersEnvironment,
      stepUser: 'Admin',
      users: ['Alice']
    })

    // And "Alice" logs in
    await ui.logInUser({ usersEnvironment, actorsEnvironment, stepUser: 'Alice' })

    // When "Alice" creates the following resources
    //   | resource  | type    | content   |
    //   | lorem.txt | txtFile | some text |
    //   | lorem.md  | mdFile  | readme    |
    await ui.userCreatesResources({
      actorsEnvironment,
      stepUser: 'Alice',
      resources: [
        { name: 'lorem.txt', type: 'txtFile', content: 'some text' },
        { name: 'lorem.md', type: 'mdFile', content: 'readme' }
      ]
    })

    // And "Alice" edits the following resources
    //   | resource  | content                   |
    //   | lorem.txt | new content edited        |
    //   | lorem.md  | new readme content edited |
    await ui.userEditsFile({
      actorsEnvironment,
      stepUser: 'Alice',
      resources: [
        { name: 'lorem.txt', content: 'new content edited' },
        { name: 'lorem.md', content: 'new readme content edited' }
      ]
    })

    // And "Alice" uploads the following resource
    //   | resource        |
    //   | simple.pdf      |
    //   | sampleGif.gif   |
    //   | testimage.mp3   |
    //   | sampleOgg.ogg   |
    //   | sampleWebm.webm |
    //   | test_video.mp4  |
    //   | testavatar.jpeg |
    //   | testavatar.png  |
    await ui.uploadResource({
      actorsEnvironment,
      filesEnvironment,
      stepUser: 'Alice',
      resources: [
        { name: 'simple.pdf' },
        { name: 'sampleGif.gif' },
        { name: 'testimage.mp3' },
        { name: 'sampleOgg.ogg' },
        { name: 'sampleWebm.webm' },
        { name: 'test_video.mp4' },
        { name: 'testavatar.jpeg' },
        { name: 'testavatar.png' }
      ]
    })

    // Then "Alice" should see thumbnail and preview for file "sampleGif.gif"
    await ui.userShouldSeeThumbnailAndPreview({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'sampleGif.gif'
    })

    // And "Alice" should see thumbnail and preview for file "testavatar.jpeg"
    await ui.userShouldSeeThumbnailAndPreview({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'testavatar.jpeg'
    })

    // And "Alice" should see thumbnail and preview for file "testavatar.png"
    await ui.userShouldSeeThumbnailAndPreview({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'testavatar.png'
    })

    // When "Alice" opens a file "testavatar.png" in the media-viewer using the sidebar panel
    await ui.userOpensMediaUsingSidebarPanel({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'testavatar.png'
    })

    // Then "Alice" is in a media-viewer
    await ui.userIsInFileViewer({
      actorsEnvironment,
      stepUser: 'Alice',
      fileViewerType: 'media-viewer'
    })

    // When "Alice" closes the file viewer
    await ui.userClosesFileViewer({ actorsEnvironment, stepUser: 'Alice' })

    // And "Alice" opens the following file in mediaviewer
    //   | resource        |
    //   | testavatar.jpeg |
    await ui.openResourceInViewer({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'testavatar.jpeg',
      application: applications.mediaViewer
    })

    // Then "Alice" is in a media-viewer
    await ui.userIsInFileViewer({
      actorsEnvironment,
      stepUser: 'Alice',
      fileViewerType: 'media-viewer'
    })

    // When "Alice" navigates to the next media resource
    await ui.userNavigatesMediaResource({
      actorsEnvironment,
      stepUser: 'Alice',
      navigationType: 'next'
    })

    // And "Alice" navigates to the previous media resource
    await ui.userNavigatesMediaResource({
      actorsEnvironment,
      stepUser: 'Alice',
      navigationType: 'previous'
    })

    // And "Alice" closes the file viewer
    await ui.userClosesFileViewer({ actorsEnvironment, stepUser: 'Alice' })

    // And "Alice" opens the following file in mediaviewer
    //   | resource      |
    //   | sampleGif.gif |
    await ui.openResourceInViewer({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'sampleGif.gif',
      application: applications.mediaViewer
    })

    // Then "Alice" is in a media-viewer
    await ui.userIsInFileViewer({
      actorsEnvironment,
      stepUser: 'Alice',
      fileViewerType: 'media-viewer'
    })

    // When "Alice" closes the file viewer
    await ui.userClosesFileViewer({ actorsEnvironment, stepUser: 'Alice' })

    // And "Alice" opens the following file in mediaviewer
    //   | resource      |
    //   | testimage.mp3 |
    await ui.openResourceInViewer({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'testimage.mp3',
      application: applications.mediaViewer
    })

    // Then "Alice" is in a media-viewer
    await ui.userIsInFileViewer({
      actorsEnvironment,
      stepUser: 'Alice',
      fileViewerType: 'media-viewer'
    })

    // When "Alice" closes the file viewer
    await ui.userClosesFileViewer({ actorsEnvironment, stepUser: 'Alice' })

    // And "Alice" opens the following file in mediaviewer
    //   | resource      |
    //   | sampleOgg.ogg |
    await ui.openResourceInViewer({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'sampleOgg.ogg',
      application: applications.mediaViewer
    })

    // Then "Alice" is in a media-viewer
    await ui.userIsInFileViewer({
      actorsEnvironment,
      stepUser: 'Alice',
      fileViewerType: 'media-viewer'
    })

    // When "Alice" closes the file viewer
    await ui.userClosesFileViewer({ actorsEnvironment, stepUser: 'Alice' })

    // And "Alice" opens the following file in mediaviewer
    //   | resource        |
    //   | sampleWebm.webm |
    await ui.openResourceInViewer({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'sampleWebm.webm',
      application: applications.mediaViewer
    })

    // Then "Alice" is in a media-viewer
    await ui.userIsInFileViewer({
      actorsEnvironment,
      stepUser: 'Alice',
      fileViewerType: 'media-viewer'
    })

    // When "Alice" closes the file viewer
    await ui.userClosesFileViewer({ actorsEnvironment, stepUser: 'Alice' })

    // And "Alice" opens the following file in mediaviewer
    //   | resource       |
    //   | test_video.mp4 |
    await ui.openResourceInViewer({
      actorsEnvironment,
      stepUser: 'Alice',
      resource: 'test_video.mp4',
      application: applications.mediaViewer
    })

    // Then "Alice" is in a media-viewer
    await ui.userIsInFileViewer({
      actorsEnvironment,
      stepUser: 'Alice',
      fileViewerType: 'media-viewer'
    })

    // And "Alice" closes the file viewer
    await ui.userClosesFileViewer({ actorsEnvironment, stepUser: 'Alice' })

    // And "Alice" logs out
    await ui.logOutUser({ actorsEnvironment, stepUser: 'Alice' })
  })
})

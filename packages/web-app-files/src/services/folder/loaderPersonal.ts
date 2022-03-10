import { FolderLoader, FolderLoaderTask, TaskContext } from '../folder'
import Router from 'vue-router'
import { useTask } from 'vue-concurrency'
import { DavProperties } from 'web-pkg/src/constants'
import { buildResource, buildWebDavFilesPath } from '../../helpers/resources'
import { isLocationSpacesActive } from '../../router'

export class FolderLoaderPersonal implements FolderLoader {
  public isEnabled(router: Router): boolean {
    return isLocationSpacesActive(router, 'files-spaces-personal-home')
  }

  public getTask(context: TaskContext): FolderLoaderTask {
    return useTask(function* (signal1, signal2, ref, sameRoute, path = null) {
      try {
        ref.CLEAR_CURRENT_FILES_LIST()

        let resources = yield ref.fetchResources(
          buildWebDavFilesPath(ref.user.id, path || context.route.params.item || ''),
          DavProperties.Default
        )
        resources = resources.map(buildResource)

        const currentFolder = resources.shift()

        ref.LOAD_FILES({
          currentFolder,
          files: resources
        })

        ref.loadIndicators({
          client: ref.$client,
          currentFolder: currentFolder.path
        })

        // Load quota
        const promiseUser = ref.$client.users.getUser(ref.user.id)
        // The semicolon is important to separate from the previous statement
        ;(async () => {
          const user = await promiseUser
          ref.SET_QUOTA(user.quota)
        })()
      } catch (error) {
        ref.SET_CURRENT_FOLDER(null)
        console.error(error)
      }

      ref.refreshFileListHeaderPosition()

      ref.accessibleBreadcrumb_focusAndAnnounceBreadcrumb(sameRoute)
      ref.scrollToResourceFromRoute()
    }).restartable()
  }
}

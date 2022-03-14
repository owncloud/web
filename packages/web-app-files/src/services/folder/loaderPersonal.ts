import { FolderLoader, FolderLoaderTask, TaskContext } from '../folder'
import Router from 'vue-router'
import { useTask } from 'vue-concurrency'
import { DavProperties } from 'web-pkg/src/constants'
import { buildResource, buildWebDavFilesPath } from '../../helpers/resources'
import { isLocationSpacesActive } from '../../router'

export const fetchResources = async (client, path, properties) => {
  try {
    return await client.files.list(path, 1, properties)
  } catch (error) {
    console.error(error)
  }
}

export class FolderLoaderPersonal implements FolderLoader {
  public isActive(router: Router): boolean {
    return isLocationSpacesActive(router, 'files-spaces-personal-home')
  }

  public getTask(context: TaskContext): FolderLoaderTask {
    const {
      store,
      router,
      clientService: { owncloudSdk: client }
    } = context

    return useTask(function* (signal1, signal2, ref, sameRoute, path = null) {
      try {
        store.commit('Files/CLEAR_CURRENT_FILES_LIST')

        let resources = yield fetchResources(
          ref.$client,
          buildWebDavFilesPath(ref.user.id, path || router.currentRoute.params.item || ''),
          DavProperties.Default
        )
        resources = resources.map(buildResource)

        const currentFolder = resources.shift()

        store.commit('Files/LOAD_FILES', {
          currentFolder,
          files: resources
        })

        store.dispatch('Files/loadIndicators', {
          client: client,
          currentFolder: currentFolder.path
        })

        // Load quota
        const promiseUser = client.users.getUser(ref.user.id)
        // The semicolon is important to separate from the previous statement
        ;(async () => {
          const user = await promiseUser
          store.commit('SET_QUOTA', user.quota)
        })()
      } catch (error) {
        store.commit('Files/SET_CURRENT_FOLDER', null)
        console.error(error)
      }

      ref.refreshFileListHeaderPosition()

      ref.accessibleBreadcrumb_focusAndAnnounceBreadcrumb(sameRoute)
      ref.scrollToResourceFromRoute()
    }).restartable()
  }
}

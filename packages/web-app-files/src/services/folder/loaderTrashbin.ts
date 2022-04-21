import { FolderLoader, FolderLoaderTask, TaskContext } from '../folder'
import Router from 'vue-router'
import { useTask } from 'vue-concurrency'
import { DavProperties } from 'web-pkg/src/constants'
import { isLocationCommonActive } from '../../router/common'
import { isLocationTrashActive } from '../../router'
import {
  buildDeletedResource,
  buildResource,
  buildWebDavFilesTrashPath,
  buildWebDavSpacesTrashPath
} from '../../helpers/resources'
import { Store } from 'vuex'

export class FolderLoaderTrashbin implements FolderLoader {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public isEnabled(store: Store<any>): boolean {
    return true
  }

  public isActive(router: Router): boolean {
    return (
      isLocationTrashActive(router, 'files-trash-personal') ||
      isLocationTrashActive(router, 'files-trash-spaces-project') ||
      isLocationCommonActive(router, 'files-common-projects-trash')
    )
  }

  public getTask(context: TaskContext): FolderLoaderTask {
    const {
      store,
      clientService: { owncloudSdk: client },
      router
    } = context

    return useTask(function* (signal1, signal2, ref) {
      store.commit('Files/CLEAR_CURRENT_FILES_LIST')

      const project = ref.$route.query.project
      const query = project ? { base_path: project } : undefined
      const path = isLocationTrashActive(router, 'files-trash-spaces-project')
        ? buildWebDavSpacesTrashPath(router.currentRoute.params.storageId)
        : buildWebDavFilesTrashPath(store.getters.user.id)
      const resources = yield client.fileTrash.list(path, '1', DavProperties.Trashbin, query)

      store.commit('Files/LOAD_FILES', {
        currentFolder: buildResource(resources[0]),
        files: resources.slice(1).map(buildDeletedResource)
      })

      ref.refreshFileListHeaderPosition()
    })
  }
}

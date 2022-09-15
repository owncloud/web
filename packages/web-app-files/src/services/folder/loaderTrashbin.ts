import { FolderLoader, FolderLoaderTask, TaskContext } from '../folder'
import Router from 'vue-router'
import { useTask } from 'vue-concurrency'
import { DavProperties } from 'web-pkg/src/constants'
import { isLocationTrashActive } from '../../router'
import {
  buildDeletedResource,
  buildResource,
  buildWebDavFilesTrashPath,
  buildWebDavSpacesTrashPath
} from '../../helpers/resources'
import { Store } from 'vuex'
import { Resource } from 'web-client'
import { useCapabilityShareJailEnabled } from 'web-pkg/src/composables'
import { unref } from '@vue/composition-api'

export class FolderLoaderTrashbin implements FolderLoader {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public isEnabled(store: Store<any>): boolean {
    return true
  }

  public isActive(router: Router): boolean {
    return isLocationTrashActive(router, 'files-trash-generic')
  }

  public getTask(context: TaskContext): FolderLoaderTask {
    const {
      store,
      clientService: { owncloudSdk: client }
    } = context
    const hasShareJail = useCapabilityShareJailEnabled(store)

    return useTask(function* (signal1, signal2, space: Resource) {
      store.commit('Files/CLEAR_CURRENT_FILES_LIST')

      const path = unref(hasShareJail)
        ? buildWebDavSpacesTrashPath(space.id)
        : buildWebDavFilesTrashPath(space.id)
      const resources = yield client.fileTrash.list(path, '1', DavProperties.Trashbin)

      store.commit('Files/LOAD_FILES', {
        currentFolder: buildResource(resources[0]),
        files: resources.slice(1).map(buildDeletedResource)
      })
    })
  }
}

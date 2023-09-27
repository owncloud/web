import { FolderLoader, FolderLoaderTask, TaskContext } from '../folder'
import { Router } from 'vue-router'
import { useTask } from 'vue-concurrency'
import { DavProperties } from 'web-client/src/webdav/constants'
import { isLocationTrashActive } from '@ownclouders/web-pkg'
import {
  buildResource,
  buildWebDavSpacesTrashPath,
  buildDeletedResource,
  buildWebDavFilesTrashPath
} from 'web-client/src/helpers'
import { Store } from 'vuex'
import { Resource } from 'web-client'
import { useCapabilityShareJailEnabled } from '@ownclouders/web-pkg'
import { unref } from 'vue'

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
      store.commit('runtime/ancestorMetaData/SET_ANCESTOR_META_DATA', {})

      const path = unref(hasShareJail)
        ? buildWebDavSpacesTrashPath(space.id.toString())
        : buildWebDavFilesTrashPath(space.id.toString())
      const resources = yield client.fileTrash.list(path, '1', DavProperties.Trashbin)

      store.commit('Files/LOAD_FILES', {
        currentFolder: buildResource(resources[0]),
        files: resources.slice(1).map(buildDeletedResource)
      })
    })
  }
}

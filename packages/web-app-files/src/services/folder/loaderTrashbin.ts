import { FolderLoader, FolderLoaderTask, TaskContext } from '../folder'
import Router from 'vue-router'
import { useTask } from 'vue-concurrency'
import { DavProperties } from 'web-pkg/src/constants'
import { isLocationCommonActive } from '../../router'
import { buildDeletedResource, buildResource } from '../../helpers/resources'

export class FolderLoaderTrashbin implements FolderLoader {
  public isEnabled(router: Router): boolean {
    return isLocationCommonActive(router, 'files-common-trash')
  }

  public getTask(context: TaskContext): FolderLoaderTask {
    return useTask(function* (signal1, signal2, ref) {
      ref.CLEAR_CURRENT_FILES_LIST()

      const resources = yield ref.$client.fileTrash.list('', '1', DavProperties.Trashbin)

      ref.LOAD_FILES({
        currentFolder: buildResource(resources[0]),
        files: resources.slice(1).map(buildDeletedResource)
      })
      ref.refreshFileListHeaderPosition()
    })
  }
}

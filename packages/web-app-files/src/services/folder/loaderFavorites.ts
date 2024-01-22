import { FolderLoader, FolderLoaderTask, TaskContext } from '../folder'
import { Router } from 'vue-router'
import { useTask } from 'vue-concurrency'
import { DavProperties } from '@ownclouders/web-client/src/webdav/constants'
import { buildResource } from '@ownclouders/web-client/src/helpers'
import { isLocationCommonActive } from '@ownclouders/web-pkg'

export class FolderLoaderFavorites implements FolderLoader {
  public isEnabled(): boolean {
    return true
  }

  public isActive(router: Router): boolean {
    return isLocationCommonActive(router, 'files-common-favorites')
  }

  public getTask(context: TaskContext): FolderLoaderTask {
    const {
      userStore,
      resourcesStore,
      clientService: { owncloudSdk: client }
    } = context

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return useTask(function* (signal1, signal2) {
      resourcesStore.clearResourceList()
      resourcesStore.setAncestorMetaData({})

      // favorite implementation is going to change soon, so we are not implementing it
      // as a proper factory in our new WebDAV client for now
      const legacyPropertyNames = DavProperties.Default.map((propertyName) => {
        const prefix = DavProperties.DavNamespace.includes(propertyName)
          ? '{DAV:}'
          : '{http://owncloud.org/ns}'

        return `${prefix}${propertyName}`
      })

      let resources = yield client.files.getFavoriteFiles(legacyPropertyNames)
      resources = resources.map((f) => {
        const resource = buildResource(f)
        // info: in oc10 we have no storageId in resources. All resources are mounted into the personal space.
        if (!resource.storageId) {
          resource.storageId = userStore.user.onPremisesSamAccountName
        }
        return resource
      })
      resourcesStore.initResourceList({ currentFolder: null, resources })
      resourcesStore.loadIndicators('/')
    })
  }
}

import { FolderLoader, FolderLoaderTask, TaskContext } from '../folder'
import Router from 'vue-router'
import { useTask } from 'vue-concurrency'
import { DavProperties, DavProperty } from 'web-pkg/src/constants'
import { buildResource } from '../../helpers/resources'
import {
  isLocationPublicActive,
  createLocationPublic,
  createLocationOperations
} from '../../router'

import { linkRoleUploaderFolder } from '../../helpers/share'
import { Store } from 'vuex'

export class FolderLoaderPublicFiles implements FolderLoader {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public isEnabled(store: Store<any>): boolean {
    return true
  }

  public isActive(router: Router): boolean {
    return isLocationPublicActive(router, 'files-public-files')
  }

  public getTask(context: TaskContext): FolderLoaderTask {
    const {
      store,
      router,
      clientService: { owncloudSdk: client }
    } = context

    return useTask(function* (signal1, signal2, ref, sameRoute, path = null) {
      store.commit('Files/CLEAR_CURRENT_FILES_LIST')

      const publicLinkPassword = store.getters['Files/publicLinkPassword']

      try {
        let resources = yield client.publicFiles.list(
          path || router.currentRoute.params.item,
          publicLinkPassword,
          DavProperties.PublicLink
        )

        // Redirect to files drop if the link has role "uploader"
        const sharePermissions = parseInt(
          resources[0].getProperty(DavProperty.PublicLinkPermission)
        )
        if (linkRoleUploaderFolder.bitmask(false) === sharePermissions) {
          router.replace(
            createLocationPublic('files-public-drop', {
              params: { token: router.currentRoute.params.item }
            })
          )
          return
        }

        resources = resources.map(buildResource)
        store.commit('Files/LOAD_FILES', {
          currentFolder: resources[0],
          files: resources.slice(1)
        })

        ref.refreshFileListHeaderPosition()
      } catch (error) {
        store.commit('Files/SET_CURRENT_FOLDER', null)
        console.error(error)

        if (error.statusCode === 401) {
          redirectToResolvePage(router)
          return
        }
      }

      ref.accessibleBreadcrumb_focusAndAnnounceBreadcrumb(sameRoute)
    })
  }
}

const redirectToResolvePage = (router: Router) => {
  router.push(
    createLocationOperations('files-operations-resolver-public-link', {
      params: { token: router.currentRoute.params.item }
    })
  )
}

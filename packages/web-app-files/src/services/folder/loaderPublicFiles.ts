import { FolderLoader, FolderLoaderTask, TaskContext } from '../folder'
import Router from 'vue-router'
import { useTask } from 'vue-concurrency'
import { DavProperties, DavProperty } from 'web-pkg/src/constants'
import { buildResource } from '../../helpers/resources'
import { isLocationPublicActive, createLocationPublic } from '../../router'

import { linkRoleUploaderFolder } from '../../helpers/share'
import { Store } from 'vuex'
import { authService } from 'web-runtime/src/services/auth'

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

      const publicLinkPassword = store.getters['runtime/auth/publicLinkPassword']

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
        if (linkRoleUploaderFolder.bitmask(false) === sharePermissions || sharePermissions === 36) {
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
          return authService.handleAuthError(router.currentRoute)
        }
      }

      ref.accessibleBreadcrumb_focusAndAnnounceBreadcrumb(sameRoute)
    })
  }
}

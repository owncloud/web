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
import omit from 'lodash-es/omit'
import { Store } from 'vuex'

export class FolderLoaderPublicFiles implements FolderLoader {
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

      // this is a workAround till we have extended the bootProcess
      // if a visitor is able to view the current page
      // the user is ready and the TOO LATE provisioning can start.
      // there is no other way at the moment to find out if:
      // publicLink is password protected
      // public link is viewable
      // so we expect if the user is able to load resources, so he also is ready
      yield unauthenticatedUserReady(router, store)
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

// hacky, get rid asap, just a workaround
const unauthenticatedUserReady = async (router: Router, store: Store<any>) => {
  // exit early which could happen if
  // the resources get reloaded
  // another application decided that the user is already provisioned
  if (store.getters.userReady) {
    return
  }

  // pretty low level, error prone and weak, add method to the store to obtain the publicToken
  // it looks like that something was available in the past, store.state.Files.publicLinkInEdit ...
  const publicToken = (router.currentRoute.params.item || '').split('/')[0]
  const publicLinkPassword = store.getters['Files/publicLinkPassword']

  await store.dispatch('loadCapabilities', {
    publicToken,
    ...(publicLinkPassword && { user: 'public', password: publicLinkPassword })
  })

  // ocis at the moment is not able to create archives for public links that are password protected
  // till this is supported by the backend remove it hard as a workaround
  // https://github.com/owncloud/web/issues/6515
  if (publicLinkPassword) {
    store.commit('SET_CAPABILITIES', {
      capabilities: omit(store.getters.capabilities, ['files.archivers']),
      version: store.getters.version
    })
  }

  store.commit('SET_USER_READY', true)
}

import { FolderLoader, FolderLoaderTask, TaskContext } from '../folder'
import Router from 'vue-router'
import { useTask } from 'vue-concurrency'
import { DavProperties, DavProperty } from 'web-pkg/src/constants'
import { buildResource } from '../../helpers/resources'
import { isLocationPublicActive, createLocationPublic } from '../../router'
import { linkRoleUploaderFolder } from '../../helpers/share'
import omit from 'lodash-es/omit'

export class FolderLoaderPublicFiles implements FolderLoader {
  public isEnabled(router: Router): boolean {
    return isLocationPublicActive(router, 'files-public-files')
  }

  public getTask(context: TaskContext): FolderLoaderTask {
    return useTask(function* (signal1, signal2, ref, sameRoute, path = null) {
      ref.CLEAR_CURRENT_FILES_LIST()

      try {
        let resources = yield ref.$client.publicFiles.list(
          path || ref.$route.params.item,
          ref.publicLinkPassword,
          DavProperties.PublicLink
        )

        // Redirect to files drop if the link has role "uploader"
        const sharePermissions = parseInt(
          resources[0].getProperty(DavProperty.PublicLinkPermission)
        )
        if (linkRoleUploaderFolder.bitmask(false) === sharePermissions) {
          ref.$router.replace(
            createLocationPublic('files-public-drop', {
              params: { token: ref.$route.params.item }
            })
          )
          return
        }

        resources = resources.map(buildResource)
        ref.LOAD_FILES({ currentFolder: resources[0], files: resources.slice(1) })

        ref.refreshFileListHeaderPosition()
      } catch (error) {
        ref.SET_CURRENT_FOLDER(null)
        console.error(error)

        if (error.statusCode === 401) {
          ref.redirectToResolvePage()
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
      yield unauthenticatedUserReady(ref.$router, ref.$store)
      ref.accessibleBreadcrumb_focusAndAnnounceBreadcrumb(sameRoute)
    })
  }
}

// hacky, get rid asap, just a workaround
const unauthenticatedUserReady = async (router, store) => {
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

import { useAccessToken, useStore } from '@ownclouders/web-pkg/src/composables'
import { useGettext } from 'vue3-gettext'
import { useService } from '@ownclouders/web-pkg/src/composables/service'
import type { UppyService } from 'web-runtime/src/services/uppyService'
import { computed, unref, ref } from 'vue'
import { Resource } from 'web-client/src'

import '@uppy/dashboard/dist/style.min.css'
import Dashboard from '@uppy/dashboard'
import OneDrive from '@uppy/onedrive'
import { Extension } from 'web-pkg/src/services/extensionRegistry'

export const extensions = ({ applicationConfig }) => {
  const store = useStore()
  const { $gettext } = useGettext()
  const accessToken = useAccessToken({ store })
  const uppyService = useService<UppyService>('$uppyService')

  const { companionUrl } = applicationConfig

  const supportedClouds = ['OneDrive']

  const currentFolder = computed<Resource>(() => {
    return store.getters['Files/currentFolder']
  })
  const canUpload = computed(() => {
    return unref(currentFolder)?.canUpload({ user: store.getters.user })
  })

  const removeUppyPlugins = () => {
    const dashboardPlugin = uppyService.getPlugin('Dashboard')
    if (dashboardPlugin) {
      uppyService.removePlugin(dashboardPlugin)
    }
    for (const cloud of supportedClouds) {
      const onedrivePlugin = uppyService.getPlugin(cloud)
      if (onedrivePlugin) {
        uppyService.removePlugin(onedrivePlugin)
      }
    }
  }

  uppyService.subscribe('addedForUpload', () => {
    return store.dispatch('hideModal')
  })

  uppyService.subscribe('uploadCompleted', () => {
    removeUppyPlugins()
    const tusPlugin = uppyService.getPlugin('Tus')
    if (tusPlugin) {
      tusPlugin.setOptions({ headers: {} })
    }
  })

  const handler = async () => {
    const tusPlugin = uppyService.getPlugin('Tus')
    if (tusPlugin) {
      tusPlugin.setOptions({
        headers: { Authorization: 'Bearer ' + unref(accessToken) }
      })
    }
    const modal = {
      variation: 'passive',
      title: $gettext('Import files'),
      cancelText: $gettext('Cancel'),
      withoutButtonConfirm: true,
      onCancel: () => {
        removeUppyPlugins()
        return store.dispatch('hideModal')
      }
    }
    await store.dispatch('createModal', modal)
    uppyService.addPlugin(Dashboard, {
      uppyService,
      inline: true,
      target: '.oc-modal-body',
      disableLocalFiles: true,
      locale: {
        strings: {
          cancel: $gettext('Cancel'),
          importFiles: $gettext('Import files from:'),
          importFrom: $gettext('Import from %{name}')
        }
      }
    })
    uppyService.addPlugin(OneDrive, {
      target: Dashboard,
      companionUrl
    })
  }

  return computed(
    () =>
      [
        {
          id: 'com.github.owncloud.web.import-file',
          type: 'action',
          action: {
            name: 'import-files',
            icon: 'cloud',
            handler,
            label: () => $gettext('Import'),
            isEnabled: () => {
              if (!companionUrl) {
                return false
              }
              // FIXME: this is only available in the files app, should probably be solved via scopes
              // if (isLocationPublicActive(router, 'files-public-link')) {
              //   return false
              // }
              return unref(canUpload)
            },
            componentType: 'button',
            class: 'oc-files-actions-import'
          }
        }
      ] satisfies Extension[]
  )
}

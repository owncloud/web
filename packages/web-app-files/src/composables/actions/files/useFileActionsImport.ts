import Dashboard from '@uppy/dashboard'
import OneDrive from '@uppy/onedrive'
import { Store } from 'vuex'
import { computed, unref } from 'vue'
import { useConfigurationManager, useRouter } from 'web-pkg/src/composables'
import { useGettext } from 'vue3-gettext'
import { Resource } from 'web-client/src/helpers'
import { useAccessToken, useRoute, useStore } from 'web-pkg/src/composables'
import { FileAction } from 'web-pkg/src/composables/actions'
import { useService } from 'web-pkg/src/composables/service'
import { UppyService } from 'web-runtime/src/services/uppyService'
import { HandleUpload } from '../../../uppyUploadPlugin'
import { isLocationPublicActive } from 'web-app-files/src/router'
import { ConfigurationManager } from 'web-pkg/types'

export const useFileActionsImport = ({
  store,
  configurationManager
}: {
  store?: Store<any>
  configurationManager?: ConfigurationManager
} = {}) => {
  store = store || useStore()
  configurationManager = configurationManager || useConfigurationManager()

  const router = useRouter()
  const route = useRoute()
  const { $gettext } = useGettext()
  const accessToken = useAccessToken({ store })
  const uppyService = useService<UppyService>('$uppyService')

  const supportedClouds = ['OneDrive']

  const currentFolder = computed<Resource>(() => {
    return store.getters['Files/currentFolder']
  })
  const canUpload = computed(() => {
    return unref(currentFolder)?.canUpload({ user: store.getters.user })
  })

  const removeUppyPlugins = () => {
    const preparePlugin = uppyService.getPlugin('HandleUpload')
    if (preparePlugin) {
      uppyService.removePlugin(preparePlugin)
    }
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

    uppyService.addPlugin(HandleUpload, { route, store, uppyService })
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
      companionUrl: configurationManager.options.upload.companionUrl
    })
  }

  const actions = computed((): FileAction[] => {
    return [
      {
        name: 'import-files',
        icon: 'cloud',
        handler,
        label: () => $gettext('Import'),
        isEnabled: () => {
          if (!configurationManager.options.upload.companionUrl) {
            return false
          }
          if (isLocationPublicActive(router, 'files-public-link')) {
            return false
          }
          return unref(canUpload)
        },
        componentType: 'button',
        class: 'oc-files-actions-import'
      }
    ]
  })

  return {
    actions
  }
}

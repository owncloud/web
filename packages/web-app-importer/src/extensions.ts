import { storeToRefs } from 'pinia'
import { useStore, usePublicLinkContext, useThemeStore, useModals } from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'
import { useService } from '@ownclouders/web-pkg'
import { computed, unref } from 'vue'
import { Resource } from '@ownclouders/web-client/src'
import type { UppyService } from '@ownclouders/web-pkg'
import '@uppy/dashboard/dist/style.min.css'
import Dashboard from '@uppy/dashboard'
import OneDrive from '@uppy/onedrive'
import { WebdavPublicLink } from '@uppy/webdav'
import GoogleDrive from '@uppy/google-drive'
import { Extension } from '@ownclouders/web-pkg'
import { ApplicationSetupOptions } from '@ownclouders/web-pkg'

export const extensions = ({ applicationConfig }: ApplicationSetupOptions) => {
  const store = useStore()
  const { $gettext } = useGettext()
  const uppyService = useService<UppyService>('$uppyService')
  const publicLinkContext = usePublicLinkContext({ store })
  const themeStore = useThemeStore()
  const { currentTheme } = storeToRefs(themeStore)
  const { registerModal, removeModal, activeModal } = useModals()

  const { companionUrl, webdavCloudType } = applicationConfig
  let { supportedClouds } = applicationConfig
  supportedClouds = supportedClouds || ['OneDrive', 'GoogleDrive', 'WebdavPublicLink']

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
      const plugin = uppyService.getPlugin(cloud)
      if (plugin) {
        uppyService.removePlugin(plugin)
      }
    }
  }

  uppyService.subscribe('addedForUpload', () => {
    if (unref(activeModal)) {
      removeModal(unref(activeModal).id)
    }
  })

  uppyService.subscribe('uploadCompleted', () => {
    removeUppyPlugins()
  })

  const handler = () => {
    const renderDarkTheme = currentTheme.value.isDark

    registerModal({
      title: $gettext('Import files'),
      hideConfirmButton: true,
      onCancel: () => {
        removeUppyPlugins()
      }
    })

    uppyService.addPlugin(Dashboard, {
      uppyService,
      inline: true,
      target: '.oc-modal-body',
      disableLocalFiles: true,
      disableStatusBar: true,
      showSelectedFiles: false,
      ...(renderDarkTheme && { theme: 'dark' }),
      locale: {
        strings: {
          cancel: $gettext('Cancel'),
          importFiles: $gettext('Import files from:'),
          importFrom: $gettext('Import from %{name}')
        }
      }
    })

    if (supportedClouds.includes('OneDrive')) {
      uppyService.addPlugin(OneDrive, {
        target: Dashboard,
        companionUrl
      })
    }

    if (supportedClouds.includes('GoogleDrive')) {
      uppyService.addPlugin(GoogleDrive, {
        target: Dashboard,
        companionUrl
      })
    }

    if (supportedClouds.includes('WebdavPublicLink')) {
      uppyService.addPlugin(WebdavPublicLink, {
        target: Dashboard,
        id: 'WebdavPublicLink',
        companionUrl,
        ...(webdavCloudType && { cloudType: webdavCloudType })
      })
    }
  }

  return computed(
    () =>
      [
        {
          id: 'com.github.owncloud.web.import-file',
          type: 'action',
          scopes: ['resource', 'upload-menu'],
          action: {
            name: 'import-files',
            icon: 'cloud',
            handler,
            label: () => $gettext('Import'),
            isEnabled: () => {
              if (!companionUrl) {
                return false
              }

              if (unref(publicLinkContext)) {
                return false
              }

              return unref(canUpload) && supportedClouds.length
            },
            isDisabled: () => !!Object.keys(uppyService.getCurrentUploads()).length,
            disabledTooltip: () => $gettext('Please wait until all imports have finished'),
            componentType: 'button',
            class: 'oc-files-actions-import'
          }
        }
      ] satisfies Extension[]
  )
}

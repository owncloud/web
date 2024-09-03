import { storeToRefs } from 'pinia'
import {
  useThemeStore,
  useModals,
  useUserStore,
  useAuthStore,
  useResourcesStore
} from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'
import { useService } from '@ownclouders/web-pkg'
import { computed, nextTick, unref } from 'vue'
import type { UppyService } from '@ownclouders/web-pkg'
import '@uppy/dashboard/dist/style.min.css'
import { Extension } from '@ownclouders/web-pkg'
import { ApplicationSetupOptions } from '@ownclouders/web-pkg'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { WebdavPublicLink } from '@uppy/webdav'

export const extensions = ({ applicationConfig }: ApplicationSetupOptions) => {
  const userStore = useUserStore()
  const { $gettext } = useGettext()
  const uppyService = useService<UppyService>('$uppyService')
  const authStore = useAuthStore()
  const themeStore = useThemeStore()
  const { currentTheme } = storeToRefs(themeStore)
  const modals = useModals()
  const { dispatchModal, removeModal } = modals
  const { activeModal } = storeToRefs(modals)

  const resourcesStore = useResourcesStore()
  const { currentFolder } = storeToRefs(resourcesStore)

  const { companionUrl, webdavCloudType } = applicationConfig
  let { supportedClouds } = applicationConfig
  supportedClouds = supportedClouds || ['OneDrive', 'GoogleDrive', 'WebdavPublicLink']

  const canUpload = computed(() => {
    return unref(currentFolder)?.canUpload({ user: userStore.user })
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

  const getUppyPlugins = async () => {
    // lazy loading to avoid loading these on page load
    const Dashboard = (await import('@uppy/dashboard')).default
    const OneDrive = (await import('@uppy/onedrive')).default
    const GoogleDrive = (await import('@uppy/google-drive')).default
    return { Dashboard, OneDrive, GoogleDrive }
  }
  const handler = async () => {
    const { Dashboard, OneDrive, GoogleDrive } = await getUppyPlugins()
    const renderDarkTheme = currentTheme.value.isDark

    dispatchModal({
      title: $gettext('Import files'),
      hideConfirmButton: true,
      onCancel: () => {
        removeUppyPlugins()
      }
    })

    await nextTick()

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

  return computed<Extension[]>(() => [
    {
      id: 'com.github.owncloud.web.import-file',
      type: 'action',
      extensionPointIds: ['app.files.upload-menu'],
      action: {
        name: 'import-files',
        icon: 'upload-cloud',
        handler,
        label: () => $gettext('Import'),
        isVisible: () => {
          if (!companionUrl) {
            return false
          }

          if (authStore.publicLinkContextReady) {
            return false
          }

          return unref(canUpload) && supportedClouds.length
        },
        isDisabled: () => !!Object.keys(uppyService.getCurrentUploads()).length,
        disabledTooltip: () => $gettext('Please wait until all imports have finished'),
        class: 'oc-files-actions-import'
      }
    }
  ])
}

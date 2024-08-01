import { Action, triggerDownloadWithFilename } from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'
import { App } from '../../types'

export type AppActionOptions = {
  app: App
}

export const useAppActionsDownload = () => {
  const { $gettext } = useGettext()

  const downloadAppAction: Action<AppActionOptions> = {
    name: 'download-app',
    icon: 'download',
    label: () => {
      return $gettext('Download')
    },
    handler: (options?) => {
      const version = options.app.mostRecentVersion
      const filename = version.filename || version.url.split('/').pop()
      triggerDownloadWithFilename(version.url, filename)
    },
    isVisible: () => {
      return true
    },
    componentType: 'button',
    appearance: 'outline'
  }

  return {
    downloadAppAction
  }
}

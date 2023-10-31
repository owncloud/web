import {
  FileActionOptions,
  isLocationSharesActive,
  isLocationSpacesActive,
  useClientService,
  useRouter,
  useStore,
  useWindowOpen
} from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'
import { computed } from 'vue'
import { Extension } from '@ownclouders/web-pkg'
import { ApplicationSetupOptions } from '@ownclouders/web-pkg'

export const extensions = (options: ApplicationSetupOptions) => {
  const store = useStore()
  const router = useRouter()
  const clientService = useClientService()
  const { $gettext } = useGettext()
  const { openUrl } = useWindowOpen()

  const handler = async ({ resources }: FileActionOptions) => {
    const resource = resources[0]

    try {
      const { data } = await clientService.httpAuthenticated.get('/sciencemesh/open-in-app', {
        params: { file: resource.path }
      })
      if (data.app_url) {
        openUrl(data.app_url)
      } else {
        return store.dispatch('showErrorMessage', {
          title: $gettext('An error occurred'),
          desc: $gettext("Couldn't open remotely")
        })
      }
    } catch (error) {
      console.log(error)
      return store.dispatch('showErrorMessage', {
        title: $gettext('An error occurred'),
        desc: $gettext("Couldn't open remotely"),
        error
      })
    }
  }

  return computed(
    () =>
      [
        {
          id: 'com.github.owncloud.web.open-file-remote',
          type: 'action',
          scopes: ['files', 'files.context-menu'],
          action: {
            name: 'open-file-remote',
            icon: 'remote-control',
            handler,
            label: () => $gettext('Open remotely'),
            isEnabled: ({ resources }: FileActionOptions) => {
              // FIXME: make easier to read
              if (
                resources.length === 1 &&
                resources[0].isFolder === false &&
                resources[0].path?.split('/').filter(Boolean)?.[0] === 'sciencemesh' &&
                (isLocationSpacesActive(router, 'files-spaces-generic') ||
                  isLocationSharesActive(router, 'files-shares-with-me'))
              ) {
                return true
              }
              return false
            },
            componentType: 'button',
            class: 'oc-files-actions-open-file-remote'
          }
        }
      ] satisfies Extension[]
  )
}

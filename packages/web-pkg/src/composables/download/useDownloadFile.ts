import { unref } from 'vue'
import { usePublicLinkContext } from '../authContext'
import { useClientService } from '../clientService'
import { useStore } from '../store'
import { triggerDownloadWithFilename } from '@ownclouders/web-pkg/src/helpers'
import { useGettext } from 'vue3-gettext'
import { useCapabilityCoreSupportUrlSigning } from '../capability'

export const useDownloadFile = () => {
  const store = useStore()
  const isPublicLinkContext = usePublicLinkContext({ store })
  const isUrlSigningEnabled = useCapabilityCoreSupportUrlSigning()
  const clientService = useClientService()
  const { $gettext } = useGettext()

  const downloadFile = async (file, version = null) => {
    const { owncloudSdk: client } = clientService
    const isUserContext = store.getters['runtime/auth/isUserContextReady']

    // construct the url and headers
    let url
    if (unref(isPublicLinkContext)) {
      url = file.downloadURL
    } else {
      if (version === null) {
        url = `${client.helpers._davPath}${file.webDavPath}`
      } else {
        url = client.fileVersions.getFileVersionUrl(file.fileId, version)
      }
    }

    // download with signing enabled
    if (isUserContext && unref(isUrlSigningEnabled)) {
      const httpClient = clientService.httpAuthenticated
      try {
        const response = await httpClient.head(url)
        if (response.status === 200) {
          const signedUrl = await client.signUrl(url)
          triggerDownloadWithFilename(signedUrl, file.name)
          return
        }
      } catch (e) {
        console.error(e)
        store.dispatch('showErrorMessage', {
          title: $gettext('Download failed'),
          desc: $gettext('File could not be located'),
          error: e
        })
      }
      return
    }

    triggerDownloadWithFilename(url, file.name)
  }

  return {
    downloadFile
  }
}

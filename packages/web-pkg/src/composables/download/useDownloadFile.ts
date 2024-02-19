import { unref } from 'vue'
import { usePublicLinkContext } from '../authContext'
import { useClientService } from '../clientService'
import { useStore } from '../store'
import { triggerDownloadWithFilename } from '../../../src/helpers'
import { useGettext } from 'vue3-gettext'
import { useCapabilityCoreSupportUrlSigning } from '../capability'
import { Store } from 'vuex'
import { ClientService } from '../../services'

export interface DownloadFileOptions {
  store?: Store<any>
  clientService?: ClientService
}

export const useDownloadFile = (options?: DownloadFileOptions) => {
  const store = options?.store || useStore()
  const isPublicLinkContext = usePublicLinkContext({ store })
  const isUrlSigningEnabled = useCapabilityCoreSupportUrlSigning()
  const clientService = options?.clientService || useClientService()
  const { $gettext } = useGettext()

  const downloadFile = async (file, version = null) => {
    const { owncloudSdk: client } = clientService
    const isUserContext = store.getters['runtime/auth/isUserContextReady']

    // public links have a pre-signed download url
    if (file.downloadURL) {
      try {
        triggerDownloadWithFilename(file.downloadURL, file.name)
      } catch (e) {
        console.error(e)
        store.dispatch('showErrorMessage', {
          title: $gettext('Download failed'),
          desc: $gettext('File could not be located'),
          errors: [e]
        })
      }
      return
    }

    // construct the download url
    const url =
      version === null
        ? `${client.helpers._davPath}${file.webDavPath}`
        : client.fileVersions.getFileVersionUrl(file.fileId, version)

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

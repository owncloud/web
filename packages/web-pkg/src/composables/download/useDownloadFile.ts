import { unref } from 'vue'
import { usePublicLinkContext } from '../authContext'
import { useClientService } from '../clientService'
import { useStore } from '../store'
import { v4 as uuidV4 } from 'uuid'
import { triggerDownloadWithFilename } from 'web-pkg/src/helpers'
import { useGettext } from 'vue3-gettext'
import { useCapabilityCoreSupportUrlSigning } from '../capability'

export const useDownloadFile = () => {
  const store = useStore()
  const isPublicLinkContext = usePublicLinkContext({ store })
  const isUrlSigningEnabled = useCapabilityCoreSupportUrlSigning()
  const { owncloudSdk: client } = useClientService()
  const { $gettext } = useGettext()

  const downloadFile = async (file, version = null) => {
    const isUserContext = store.getters['runtime/auth/isUserContextReady']

    // construct the url and headers
    let url = null
    let headers: Record<string, string> = { 'X-Request-ID': uuidV4() }
    if (unref(isPublicLinkContext)) {
      url = file.downloadURL
    } else {
      if (version === null) {
        url = `${client.helpers._davPath}${file.webDavPath}`
      } else {
        url = client.fileVersions.getFileVersionUrl(file.fileId, version)
      }
      const accessToken = store.getters['runtime/auth/accessToken']
      headers = { Authorization: 'Bearer ' + accessToken }
    }

    // download with signing enabled
    if (isUserContext && unref(isUrlSigningEnabled)) {
      try {
        const response = await fetch(url, {
          method: 'HEAD',
          headers
        })
        if (response.status === 200) {
          const signedUrl = await client.signUrl(url)
          triggerDownloadWithFilename(signedUrl, file.name)
          return
        }
      } catch (e) {
        console.error(e)
      }
      store.dispatch('showMessage', {
        title: $gettext('Download failed'),
        desc: $gettext('File could not be located'),
        status: 'danger',
        autoClose: {
          enabled: true
        }
      })
      return
    }

    triggerDownloadWithFilename(url, file.name)
  }

  return {
    downloadFile
  }
}

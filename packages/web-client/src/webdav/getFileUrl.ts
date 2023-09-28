import { Resource, SpaceResource } from '../helpers'
import { urlJoin } from '../utils'
import { GetFileContentsFactory } from './getFileContents'
import { WebDavOptions } from './types'

export const GetFileUrlFactory = (
  getFileContentsFactory: ReturnType<typeof GetFileContentsFactory>,
  { sdk, store }: WebDavOptions
) => {
  return {
    async getFileUrl(
      space: SpaceResource,
      resource: Resource,
      {
        disposition = 'attachment',
        signUrlTimeout = 86400
      }: {
        disposition?: 'inline' | 'attachment'
        signUrlTimeout?: number
      }
    ): Promise<string> {
      const inlineDisposition = disposition === 'inline'
      const isUrlSigningEnabled = store.getters.capabilities?.core['support-url-signing'] === true
      const { path } = resource
      let { downloadURL } = resource

      let signed = true
      if (!downloadURL && !inlineDisposition) {
        // compute unsigned url
        const webDavPath = urlJoin(space.webDavPath, path)
        downloadURL = sdk.files.getFileUrl(webDavPath)

        // sign url
        if (isUrlSigningEnabled) {
          downloadURL = await sdk.signUrl(downloadURL, signUrlTimeout)
        } else {
          signed = false
        }
      }

      // FIXME: re-introduce query parameters
      // They are not supported by getFileContents() and as we don't need them right now, I'm disabling the feature completely for now
      //
      // // Since the pre-signed url contains query parameters and the caller of this method
      // // can also provide query parameters we have to combine them.
      // const queryStr = qs.stringify(options.query || null)
      // const [url, signedQuery] = downloadURL.split('?')
      // const combinedQuery = [queryStr, signedQuery].filter(Boolean).join('&')
      // downloadURL = [url, combinedQuery].filter(Boolean).join('?')

      if (!signed || inlineDisposition) {
        const response = await getFileContentsFactory.getFileContents(space, resource, {
          responseType: 'blob'
        })
        downloadURL = URL.createObjectURL(response.body)
      }

      return downloadURL
    },
    revokeUrl: (url: string) => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url)
      }
    }
  }
}

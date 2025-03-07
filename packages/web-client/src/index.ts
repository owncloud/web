import { AxiosInstance } from 'axios'
import { graph, Graph } from './graph'
import { ocs, OCS } from './ocs'
import { WebDAV, webdav } from './webdav'

export * from './errors'
export * from './helpers'
export * from './utils'

export { graph, ocs, webdav }

interface Client {
  graph: Graph
  ocs: OCS
  webdav: WebDAV
}

type ClientOptions = {
  axiosClient: AxiosInstance
  baseURI: string
}

/** @deprecated use `graph()`, `ocs()` and `webdav()` to initialize and use clients */
export const client = ({ axiosClient, baseURI }: ClientOptions): Client => {
  const webDavHeaders = () => {
    const authHeader = axiosClient.defaults?.headers?.Authorization
    const languageHeader = axiosClient.defaults?.headers?.['Accept-Language']
    const initiatorIdHeader = axiosClient.defaults?.headers?.['Initiator-ID']

    return {
      ...(authHeader && { Authorization: authHeader.toString() }),
      ...(languageHeader && { 'Accept-Language': languageHeader.toString() }),
      ...(initiatorIdHeader && { 'Initiator-ID': initiatorIdHeader.toString() })
    }
  }

  return {
    graph: graph(baseURI, axiosClient),
    ocs: ocs(baseURI, axiosClient),
    webdav: webdav(baseURI, () => {}, webDavHeaders)
  }
}

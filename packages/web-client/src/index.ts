import { AxiosInstance } from 'axios'
import { graph, Graph } from './graph'
import { ocs, OCS } from './ocs'
import { WebDAV, webdav } from './webdav'

export * from './errors'
export * from './helpers'
export * from './utils'

interface Client {
  graph: Graph
  ocs: OCS
  webdav: WebDAV
}

type ClientOptions = {
  axiosClient: AxiosInstance
  baseURI: string
}

export const client = ({ axiosClient, baseURI }: ClientOptions): Client => {
  return {
    graph: graph(baseURI, axiosClient),
    ocs: ocs(baseURI, axiosClient),
    webdav: webdav({ axiosClient, baseUrl: baseURI })
  }
}

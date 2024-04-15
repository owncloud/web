import { AxiosInstance } from 'axios'
import { graph, Graph } from './graph'
import { ocs, OCS } from './ocs'
import { WebDAV, webdav } from './webdav'

export type { Graph } from './graph'
export type { OCS } from './ocs'
export type { WebDAV } from './webdav'

export * as errors from './errors'
export * as helpers from './helpers'
export * as webdav from './webdav'

export type { Resource, SpaceResource, User } from './helpers'

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

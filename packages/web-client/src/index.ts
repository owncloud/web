import { AxiosInstance } from 'axios'
import { graph, Graph } from './graph'
import { ocs, OCS } from './ocs'
import { User } from './generated'
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
  user: User
}

export const client = ({ axiosClient, baseURI, user }: ClientOptions): Client => {
  return {
    graph: graph(baseURI, axiosClient),
    ocs: ocs(baseURI, axiosClient, user),
    webdav: webdav({ axiosClient, baseUrl: baseURI, user })
  }
}

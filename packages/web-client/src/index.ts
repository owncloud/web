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
  accessToken: string
  axiosClient: AxiosInstance
  baseURI: string
  clientInitiatorId: string
  language: string
  user: User
}

export const client = ({
  accessToken,
  axiosClient,
  baseURI,
  clientInitiatorId,
  language,
  user
}: ClientOptions): Client => {
  return {
    graph: graph(baseURI, axiosClient),
    ocs: ocs(baseURI, axiosClient, user),
    webdav: webdav({
      accessToken,
      axiosClient,
      baseUrl: baseURI,
      clientInitiatorId,
      language,
      user
    })
  }
}

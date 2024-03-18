import { AxiosInstance } from 'axios'
import { graph, Graph } from './graph'
import { ocs, OCS } from './ocs'
import { User } from './generated'
import { Ref } from 'vue'

export type { Graph } from './graph'
export type { OCS } from './ocs'

export * as errors from './errors'
export * as helpers from './helpers'
export * as webdav from './webdav'

export type { Resource, SpaceResource, User } from './helpers'

interface Client {
  graph: Graph
  ocs: OCS
}

export const client = (baseURI: string, axiosClient: AxiosInstance, user: Ref<User>): Client => {
  return {
    graph: graph(baseURI, axiosClient),
    ocs: ocs(baseURI, axiosClient, user)
  }
}

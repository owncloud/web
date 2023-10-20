import { AxiosInstance } from 'axios'
import { graph, Graph } from './graph'
import { ocs, OCS } from './ocs'

export type { Graph } from './graph'
export type { OCS } from './ocs'

export * as helpers from './helpers'
export * as errors from './errors'

export type { Resource, SpaceResource, User } from './helpers'

interface Client {
  graph: Graph
  ocs: OCS
}

export const client = (baseURI: string, axiosClient: AxiosInstance): Client => {
  return {
    graph: graph(baseURI, axiosClient),
    ocs: ocs(baseURI, axiosClient)
  }
}

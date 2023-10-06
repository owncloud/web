import { AxiosInstance } from 'axios'
import { graph, Graph } from './graph'
import { ocs, OCS } from './ocs'
import { sse, SSE } from './sse'

export type { Graph } from './graph'
export type { OCS } from './ocs'

export * as helpers from './helpers'

export type { Resource, SpaceResource, User } from './helpers'

export interface FetchOptions {
  headers: Record<string, string>
}

interface Client {
  graph: Graph
  ocs: OCS
  sse: SSE
}

export const client = (
  baseURI: string,
  axiosClient: AxiosInstance,
  fetchOptions: FetchOptions
): Client => {
  return {
    graph: graph(baseURI, axiosClient),
    ocs: ocs(baseURI, axiosClient),
    sse: sse(baseURI, fetchOptions)
  }
}

import { AxiosInstance } from 'axios'
import { graph, Graph } from './graph'
import { ocs, OCS } from './ocs'

export { Graph } from './graph'
export { OCS } from './ocs'

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

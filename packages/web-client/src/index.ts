import axios from 'axios'
import { graph, Graph } from './graph'
import { ocs, OCS } from './ocs'
import { Auth, AuthParameters } from './auth'

export { Graph } from './graph'
export { OCS } from './ocs'
export { AuthParameters } from './auth'

interface Client {
  graph: Graph
  ocs: OCS
}

export const client = (baseURI: string, authParams: AuthParameters): Client => {
  const auth = new Auth(authParams)
  const axiosClient = axios.create({
    headers: auth.getHeaders()
  })

  axiosClient.interceptors.request.use((config) => {
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    return config
  })

  return {
    graph: graph(baseURI, axiosClient),
    ocs: ocs(baseURI, axiosClient)
  }
}

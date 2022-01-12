import axios, { AxiosInstance } from 'axios'
import { Configuration, MeDrivesApi } from './generated'

interface Graph {
  drives: Pick<MeDrivesApi, 'listMyDrives'>
}

const graph = (baseURI: string, axiosClient: AxiosInstance): Graph => {
  const basePath = new URL('/graph/v1.0', baseURI).href
  const config = new Configuration({
    basePath
  })

  const meDrivesApi = new MeDrivesApi(config, config.basePath, axiosClient)

  return {
    drives: {
      listMyDrives: () => meDrivesApi.listMyDrives()
    }
  }
}

interface Client {
  graph: Graph
}

export const client = (baseURI: string, token: string): Client => {
  const axiosClient = axios.create({
    headers: {
      authorization: 'Bearer ' + token,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })

  axiosClient.interceptors.request.use((config) => {
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    return config
  })

  return {
    graph: graph(baseURI, axiosClient)
  }
}

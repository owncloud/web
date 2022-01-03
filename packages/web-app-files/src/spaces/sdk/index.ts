import axios, { AxiosPromise } from 'axios'
import { CollectionOfDrives, Configuration, MeDrivesApi } from './generated'

export const spacesSDK = (baseURI: string, token: string): any => {
  const basePath = new URL('/graph/v1.0', baseURI).href

  const config = new Configuration({
    basePath
  })

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

  const meDrivesApi = new MeDrivesApi(config, config.basePath, axiosClient)

  return {
    drives: {
      listMyDrives: (): AxiosPromise<CollectionOfDrives> => meDrivesApi.listMyDrives()
    }
  }
}

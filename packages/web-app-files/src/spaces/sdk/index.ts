import { listMyDrives } from './drives'
import axios from 'axios'
import { Configuration } from './generated'

export const spacesSDK = (baseURI, token) => {
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

  return {
    drives: {
      listMyDrives: () => {
        return listMyDrives(axiosClient, config)
      }
    }
  }
}

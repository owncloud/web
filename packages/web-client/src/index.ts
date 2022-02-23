import axios, { AxiosInstance, AxiosPromise, AxiosResponse } from 'axios'
import {
  Configuration,
  MeDrivesApi,
  Drive,
  DrivesApiFactory,
  CollectionOfDrives,
  UserApiFactory,
  User
} from './generated'

export interface Graph {
  drives: {
    listMyDrives: (orderBy?: string, filter?: string) => Promise<AxiosResponse<CollectionOfDrives>>
    getDrive: (id: string) => AxiosPromise<Drive>
    createDrive: (drive: Drive, options: any) => AxiosPromise<Drive>
    updateDrive: (id: string, drive: Drive, options: any) => AxiosPromise<Drive>
    deleteDrive: (id: string, ifMatch: string, options: any) => AxiosPromise<void>
  }
  users: {
    getUser: (userId: string) => AxiosPromise<User>
  }
}

const graph = (baseURI: string, axiosClient: AxiosInstance): Graph => {
  const basePath = new URL('/graph/v1.0', baseURI).href
  const config = new Configuration({
    basePath
  })

  const meDrivesApi = new MeDrivesApi(config, config.basePath, axiosClient)
  const userApiFactory = UserApiFactory(config, config.basePath, axiosClient)
  const drivesApiFactory = DrivesApiFactory(config, config.basePath, axiosClient)

  return <Graph>{
    drives: {
      listMyDrives: (orderBy?: string, filter?: string) =>
        meDrivesApi.listMyDrives(0, 0, orderBy, filter),
      getDrive: (id: string) => drivesApiFactory.getDrive(id),
      createDrive: (drive: Drive, options: any): AxiosPromise<Drive> =>
        drivesApiFactory.createDrive(drive, options),
      updateDrive: (id: string, drive: Drive, options: any): AxiosPromise<Drive> =>
        drivesApiFactory.updateDrive(id, drive, options),
      deleteDrive: (id: string, ifMatch: string, options: any): AxiosPromise<void> =>
        drivesApiFactory.deleteDrive(id, ifMatch, options)
    },
    users: {
      getUser: (userId: string) => userApiFactory.getUser(userId)
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

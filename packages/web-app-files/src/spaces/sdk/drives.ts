import { Configuration, MeDrivesApi, CollectionOfDrives } from './generated'
import { AxiosInstance, AxiosPromise } from 'axios'

export const listMyDrives = async (
  axiosClient: AxiosInstance,
  config: Configuration
): Promise<AxiosPromise<CollectionOfDrives>> => {
  const meDrivesApi = new MeDrivesApi(config, config.basePath, axiosClient)
  return await meDrivesApi.listMyDrives()
}

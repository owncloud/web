import { buildSpace } from '../../helpers'
import { Drive, DrivesApiFactory, DrivesGetDrivesApi, MeDrivesApi } from './../generated'
import type { GraphFactoryOptions } from './../types'
import type { GraphDrives } from './types'

const getServerUrlFromDrive = (drive: Drive) => new URL(drive.webUrl).origin

export const DrivesFactory = ({ axiosClient, config }: GraphFactoryOptions): GraphDrives => {
  const drivesApiFactory = DrivesApiFactory(config, config.basePath, axiosClient)
  const meDrivesApi = new MeDrivesApi(config, config.basePath, axiosClient)
  const allDrivesApi = new DrivesGetDrivesApi(config, config.basePath, axiosClient)

  return {
    async getDrive(id, graphRoles, requestOptions) {
      const { data: drive } = await drivesApiFactory.getDriveBeta(id, requestOptions)
      return buildSpace({ ...drive, serverUrl: getServerUrlFromDrive(drive) }, graphRoles)
    },

    async createDrive(data, graphRoles, requestOptions) {
      const { data: drive } = await drivesApiFactory.createDriveBeta(data, requestOptions)
      return buildSpace({ ...drive, serverUrl: getServerUrlFromDrive(drive) }, graphRoles)
    },

    async updateDrive(id, data, graphRoles, requestOptions) {
      const { data: drive } = await drivesApiFactory.updateDriveBeta(id, data, requestOptions)
      return buildSpace({ ...drive, serverUrl: getServerUrlFromDrive(drive) }, graphRoles)
    },

    async disableDrive(id, ifMatch, requestOptions) {
      await drivesApiFactory.deleteDriveBeta(id, ifMatch, requestOptions)
    },

    async deleteDrive(id, ifMatch, requestOptions) {
      await drivesApiFactory.deleteDriveBeta(id, ifMatch, {
        ...requestOptions,
        // axios (>= 1.20) drops request headers named after an HTTP method while flattening
        // the config headers, and `purge` is one of them. Setting the header in
        // transformRequest runs after that step, so it reaches the server.
        transformRequest: [
          (data, headers) => {
            headers.set('Purge', 'T')
            return data
          },
          ...[].concat(axiosClient.defaults.transformRequest ?? [])
        ]
      })
    },

    async listMyDrives(graphRoles, options, requestOptions) {
      const {
        data: { value }
      } = await meDrivesApi.listMyDrivesBeta(options?.orderBy, options?.filter, requestOptions)
      return value.map((d) => buildSpace({ ...d, serverUrl: getServerUrlFromDrive(d) }, graphRoles))
    },

    async listAllDrives(graphRoles, options, requestOptions) {
      const {
        data: { value }
      } = await allDrivesApi.listAllDrivesBeta(options?.orderBy, options?.filter, requestOptions)
      return value.map((d) => buildSpace({ ...d, serverUrl: getServerUrlFromDrive(d) }, graphRoles))
    }
  }
}

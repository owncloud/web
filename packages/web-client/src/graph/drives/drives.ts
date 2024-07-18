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
    async getDrive(id, requestOptions) {
      const { data: drive } = await drivesApiFactory.getDrive(id, requestOptions)
      return buildSpace({ ...drive, serverUrl: getServerUrlFromDrive(drive) })
    },

    async createDrive(data, requestOptions) {
      const { data: drive } = await drivesApiFactory.createDrive(data, requestOptions)
      return buildSpace({ ...drive, serverUrl: getServerUrlFromDrive(drive) })
    },

    async updateDrive(id, data, requestOptions) {
      const { data: drive } = await drivesApiFactory.updateDrive(id, data, requestOptions)
      return buildSpace({ ...drive, serverUrl: getServerUrlFromDrive(drive) })
    },

    async disableDrive(id, ifMatch, requestOptions) {
      await drivesApiFactory.deleteDrive(id, ifMatch, requestOptions)
    },

    async deleteDrive(id, ifMatch, requestOptions) {
      await drivesApiFactory.deleteDrive(id, ifMatch, {
        headers: {
          ...((requestOptions?.headers && requestOptions.headers) || {}),
          Purge: 'T'
        },
        ...((requestOptions && { requestOptions }) || {})
      })
    },

    async listMyDrives(options, requestOptions) {
      const {
        data: { value }
      } = await meDrivesApi.listMyDrives(options?.orderBy, options?.filter, requestOptions)
      return value.map((d) => buildSpace({ ...d, serverUrl: getServerUrlFromDrive(d) }))
    },

    async listAllDrives(options, requestOptions) {
      const {
        data: { value }
      } = await allDrivesApi.listAllDrives(options?.orderBy, options?.filter, requestOptions)
      return value.map((d) => buildSpace({ ...d, serverUrl: getServerUrlFromDrive(d) }))
    }
  }
}

import { buildSpace } from '../../helpers'
import { Drive, DrivesApiFactory, DrivesGetDrivesApi, MeDrivesApi } from './../generated'
import type { GraphFactoryOptions } from './../types'
import type { GraphDrives } from './types'

const getServerUrlFromDrive = (drive: Drive) => new URL(drive.webUrl).origin

const roleIdv1Tov2Map = {
  manager: '312c0871-5ef7-4b3a-85b6-0e4074c64049',
  editor: '58c63c02-1d89-4572-916a-870abc5a1b7d',
  viewer: 'a8d5fe5e-96e3-418d-825b-534dbdf22b99'
}

// FIXME: convert old v1 drive to v2 drive. remove with https://github.com/owncloud/ocis/issues/9884
const v1Tov2Drive = (drive: Drive) => {
  drive.root?.permissions?.forEach((p) => {
    p.grantedToV2 = p.grantedToV2 || p.grantedToIdentities?.[0]
    delete p.grantedToIdentities
    const oldRole = p.roles[0]
    if (oldRole) {
      p.roles[0] = roleIdv1Tov2Map[oldRole]
    }
  })
  return drive
}

export const DrivesFactory = ({ axiosClient, config }: GraphFactoryOptions): GraphDrives => {
  const drivesApiFactory = DrivesApiFactory(config, config.basePath, axiosClient)
  const meDrivesApi = new MeDrivesApi(config, config.basePath, axiosClient)
  const allDrivesApi = new DrivesGetDrivesApi(config, config.basePath, axiosClient)

  return {
    async getDrive(id, graphRoles, requestOptions) {
      let { data: drive } = await drivesApiFactory.getDrive(id, requestOptions)
      drive = v1Tov2Drive(drive)
      return buildSpace({ ...drive, serverUrl: getServerUrlFromDrive(drive) }, graphRoles)
    },

    async createDrive(data, graphRoles, requestOptions) {
      let { data: drive } = await drivesApiFactory.createDrive(data, requestOptions)
      drive = v1Tov2Drive(drive)
      return buildSpace({ ...drive, serverUrl: getServerUrlFromDrive(drive) }, graphRoles)
    },

    async updateDrive(id, data, graphRoles, requestOptions) {
      let { data: drive } = await drivesApiFactory.updateDrive(id, data, requestOptions)
      drive = v1Tov2Drive(drive)
      return buildSpace({ ...drive, serverUrl: getServerUrlFromDrive(drive) }, graphRoles)
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

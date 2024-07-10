import { AxiosInstance, AxiosPromise, AxiosResponse } from 'axios'
import {
  CollectionOfDrives,
  Configuration,
  Drive,
  DrivesApiFactory,
  MeDrivesApi,
  DrivesGetDrivesApi,
  MeDriveApiFactory,
  RoleManagementApiFactory,
  UnifiedRoleDefinition,
  CollectionOfDriveItems1,
  DriveItemApiFactory,
  DrivesRootApiFactory,
  DriveItem,
  DrivesPermissionsApiFactory,
  Permission,
  DriveItemCreateLink,
  DriveItemInvite,
  SharingLinkPassword,
  CollectionOfPermissions,
  CollectionOfPermissionsWithAllowedValues
} from './generated'
import { type GraphUsers, UsersFactory } from './users'
import { type GraphGroups, GroupsFactory } from './groups'
import { ApplicationsFactory, GraphApplications } from './applications'
import { TagsFactory, GraphTags } from './tags'
import { ActivitiesFactory, GraphActivities } from './activities'

export interface Graph {
  activities: GraphActivities
  applications: GraphApplications
  tags: GraphTags
  drives: {
    listMyDrives: (orderBy?: string, filter?: string) => Promise<AxiosResponse<CollectionOfDrives>>
    listAllDrives: (orderBy?: string, filter?: string) => Promise<AxiosResponse<CollectionOfDrives>>
    listSharedWithMe: () => AxiosPromise<CollectionOfDriveItems1>
    listSharedByMe: () => AxiosPromise<CollectionOfDriveItems1>
    getDrive: (id: string) => AxiosPromise<Drive>
    createDrive: (drive: Drive, options: any) => AxiosPromise<Drive>
    updateDrive: (id: string, drive: Drive, options: any) => AxiosPromise<Drive>
    disableDrive: (id: string) => AxiosPromise<void>
    deleteDrive: (id: string) => AxiosPromise<void>
    deleteDriveItem: (driveId: string, itemId: string) => AxiosPromise<void>
    updateDriveItem: (
      driveId: string,
      itemId: string,
      driveItem: DriveItem
    ) => AxiosPromise<DriveItem>
    createDriveItem: (driveId: string, driveItem: DriveItem) => AxiosPromise<DriveItem>
  }
  users: GraphUsers
  groups: GraphGroups
  roleManagement: {
    listPermissionRoleDefinitions: () => AxiosPromise<UnifiedRoleDefinition>
  }
  permissions: {
    getPermission: (driveId: string, itemId: string, permId: string) => AxiosPromise<Permission>
    listPermissions: (
      driveId: string,
      itemId: string
    ) => AxiosPromise<CollectionOfPermissionsWithAllowedValues>
    listPermissionsSpaceRoot: (
      driveId: string
    ) => AxiosPromise<CollectionOfPermissionsWithAllowedValues>
    createLink: (
      driveId: string,
      itemId: string,
      driveItemCreateLink?: DriveItemCreateLink
    ) => AxiosPromise<Permission>
    createLinkSpaceRoot: (
      driveId: string,
      driveItemCreateLink?: DriveItemCreateLink
    ) => AxiosPromise<Permission>
    invite: (
      driveId: string,
      itemId: string,
      driveItemInvite?: DriveItemInvite
    ) => AxiosPromise<CollectionOfPermissions>
    inviteSpaceRoot: (
      driveId: string,
      driveItemInvite?: DriveItemInvite
    ) => AxiosPromise<CollectionOfPermissions>
    deletePermission: (driveId: string, itemId: string, permId: string) => AxiosPromise<void>
    deletePermissionSpaceRoot: (driveId: string, permId: string) => AxiosPromise<void>
    updatePermission: (
      driveId: string,
      itemId: string,
      permId: string,
      permission: Permission
    ) => AxiosPromise<Permission>
    updatePermissionSpaceRoot: (
      driveId: string,
      permId: string,
      permission: Permission
    ) => AxiosPromise<Permission>
    setPermissionPassword: (
      driveId: string,
      itemId: string,
      permId: string,
      sharingLinkPassword: SharingLinkPassword
    ) => AxiosPromise<Permission>
    setPermissionPasswordSpaceRoot: (
      driveId: string,
      permId: string,
      sharingLinkPassword: SharingLinkPassword
    ) => AxiosPromise<Permission>
  }
}

export const graph = (baseURI: string, axiosClient: AxiosInstance): Graph => {
  const url = new URL(baseURI)
  url.pathname = [...url.pathname.split('/'), 'graph'].filter(Boolean).join('/')
  const config = new Configuration({
    basePath: url.href
  })

  const meDrivesApi = new MeDrivesApi(config, config.basePath, axiosClient)
  const allDrivesApi = new DrivesGetDrivesApi(config, config.basePath, axiosClient)
  const meDriveApiFactory = MeDriveApiFactory(config, config.basePath, axiosClient)
  const drivesApiFactory = DrivesApiFactory(config, config.basePath, axiosClient)
  const roleManagementApiFactory = RoleManagementApiFactory(config, config.basePath, axiosClient)
  const driveItemApiFactory = DriveItemApiFactory(config, config.basePath, axiosClient)
  const drivesRootApiFactory = DrivesRootApiFactory(config, config.basePath, axiosClient)
  const drivesPermissionsApiFactory = DrivesPermissionsApiFactory(
    config,
    config.basePath,
    axiosClient
  )

  return <Graph>{
    activities: ActivitiesFactory({ axiosClient, config }),
    applications: ApplicationsFactory({ axiosClient, config }),
    tags: TagsFactory({ axiosClient, config }),
    drives: {
      listMyDrives: (orderBy?: string, filter?: string) =>
        meDrivesApi.listMyDrives(orderBy, filter),
      listAllDrives: (orderBy?: string, filter?: string) =>
        allDrivesApi.listAllDrives(orderBy, filter),
      listSharedWithMe: () => meDriveApiFactory.listSharedWithMe(),
      listSharedByMe: () => meDriveApiFactory.listSharedByMe(),
      getDrive: (id: string) => drivesApiFactory.getDrive(id),
      createDrive: (drive: Drive, options: any): AxiosPromise<Drive> =>
        drivesApiFactory.createDrive(drive, options),
      updateDrive: (id: string, drive: Drive, options: any): AxiosPromise<Drive> =>
        drivesApiFactory.updateDrive(id, drive, options),
      disableDrive: (id: string): AxiosPromise<void> => drivesApiFactory.deleteDrive(id, '', {}),
      deleteDrive: (id: string): AxiosPromise<void> =>
        drivesApiFactory.deleteDrive(id, '', {
          headers: {
            Purge: 'T'
          }
        }),
      deleteDriveItem: (driveId: string, itemId: string) =>
        driveItemApiFactory.deleteDriveItem(driveId, itemId),
      updateDriveItem: (driveId: string, itemId: string, driveItem: DriveItem) =>
        driveItemApiFactory.updateDriveItem(driveId, itemId, driveItem),
      createDriveItem: (driveId: string, driveItem: DriveItem) =>
        drivesRootApiFactory.createDriveItem(driveId, driveItem)
    },
    users: UsersFactory({ axiosClient, config }),
    groups: GroupsFactory({ axiosClient, config }),
    roleManagement: {
      listPermissionRoleDefinitions: () => roleManagementApiFactory.listPermissionRoleDefinitions()
    },
    permissions: {
      getPermission: (driveId: string, itemId: string, permId: string) =>
        drivesPermissionsApiFactory.getPermission(driveId, itemId, permId),
      listPermissions: (driveId: string, itemId: string) =>
        drivesPermissionsApiFactory.listPermissions(driveId, itemId),
      listPermissionsSpaceRoot: (driveId: string) =>
        drivesRootApiFactory.listPermissionsSpaceRoot(driveId),
      createLink: (driveId: string, itemId: string, driveItemCreateLink?: DriveItemCreateLink) =>
        drivesPermissionsApiFactory.createLink(driveId, itemId, driveItemCreateLink),
      createLinkSpaceRoot: (driveId: string, driveItemCreateLink?: DriveItemCreateLink) =>
        drivesRootApiFactory.createLinkSpaceRoot(driveId, driveItemCreateLink),
      invite: (driveId: string, itemId: string, driveItemInvite?: DriveItemInvite) =>
        drivesPermissionsApiFactory.invite(driveId, itemId, driveItemInvite),
      inviteSpaceRoot: (driveId: string, driveItemInvite?: DriveItemInvite) =>
        drivesRootApiFactory.inviteSpaceRoot(driveId, driveItemInvite),
      deletePermission: (driveId: string, itemId: string, permId: string) =>
        drivesPermissionsApiFactory.deletePermission(driveId, itemId, permId),
      deletePermissionSpaceRoot: (driveId: string, permId: string) =>
        drivesRootApiFactory.deletePermissionSpaceRoot(driveId, permId),
      updatePermission: (driveId: string, itemId: string, permId: string, permission: Permission) =>
        drivesPermissionsApiFactory.updatePermission(driveId, itemId, permId, permission),
      updatePermissionSpaceRoot: (driveId: string, permId: string, permission: Permission) =>
        drivesRootApiFactory.updatePermissionSpaceRoot(driveId, permId, permission),
      setPermissionPassword: (
        driveId: string,
        itemId: string,
        permId: string,
        sharingLinkPassword: SharingLinkPassword
      ) =>
        drivesPermissionsApiFactory.setPermissionPassword(
          driveId,
          itemId,
          permId,
          sharingLinkPassword
        ),
      setPermissionPasswordSpaceRoot: (
        driveId: string,
        permId: string,
        sharingLinkPassword: SharingLinkPassword
      ) => drivesRootApiFactory.setPermissionPasswordSpaceRoot(driveId, permId, sharingLinkPassword)
    }
  }
}

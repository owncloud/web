import { AxiosInstance, AxiosPromise, AxiosResponse } from 'axios'
import {
  CollectionOfDrives,
  CollectionOfGroup,
  CollectionOfUser,
  Configuration,
  Drive,
  DrivesApiFactory,
  Group,
  GroupApiFactory,
  GroupsApiFactory,
  MeChangepasswordApiFactory,
  MeDrivesApi,
  MeUserApiFactory,
  User,
  UserApiFactory,
  UsersApiFactory,
  TagsApiFactory,
  CollectionOfTags,
  TagAssignment,
  TagUnassignment,
  DrivesGetDrivesApi,
  CollectionOfApplications,
  ApplicationsApiFactory,
  UserAppRoleAssignmentApiFactory,
  AppRoleAssignment,
  ExportPersonalDataRequest
} from './generated'
import { omit } from 'lodash-es'

export interface Graph {
  applications: {
    listApplications: () => AxiosPromise<CollectionOfApplications>
  }
  tags: {
    getTags: () => AxiosPromise<CollectionOfTags>
    assignTags: (tagAssignment?: TagAssignment) => AxiosPromise<void>
    unassignTags: (tagUnassignment?: TagUnassignment) => AxiosPromise<void>
  }
  drives: {
    listMyDrives: (orderBy?: string, filter?: string) => Promise<AxiosResponse<CollectionOfDrives>>
    listAllDrives: (orderBy?: string, filter?: string) => Promise<AxiosResponse<CollectionOfDrives>>
    getDrive: (id: string) => AxiosPromise<Drive>
    createDrive: (drive: Drive, options: any) => AxiosPromise<Drive>
    updateDrive: (id: string, drive: Drive, options: any) => AxiosPromise<Drive>
    disableDrive: (id: string) => AxiosPromise<void>
    deleteDrive: (id: string) => AxiosPromise<void>
  }
  users: {
    getUser: (userId: string) => AxiosPromise<User>
    createUser: (user: User) => AxiosPromise<User>
    getMe: () => AxiosPromise<User>
    changeOwnPassword: (currentPassword: string, newPassword: string) => AxiosPromise<void>
    editUser: (userId: string, user: User) => AxiosPromise<User>
    deleteUser: (userId: string) => AxiosPromise<void>
    listUsers: (orderBy?: string, filter?: string) => AxiosPromise<CollectionOfUser>
    createUserAppRoleAssignment: (
      userId: string,
      appRoleAssignment: AppRoleAssignment
    ) => AxiosPromise<AppRoleAssignment>
    exportPersonalData: (
      userId: string,
      exportPersonalDataRequest?: ExportPersonalDataRequest
    ) => AxiosPromise<void>
  }
  groups: {
    listGroups: (orderBy?: string) => AxiosPromise<CollectionOfGroup>
    createGroup: (group: Group) => AxiosPromise<Group>
    getGroup: (groupId: string) => AxiosPromise<Group>
    editGroup: (groupId: string, group: Group) => AxiosPromise<void>
    deleteGroup: (groupId: string) => AxiosPromise<void>
    addMember: (groupId: string, userId: string, server: string) => AxiosPromise<void>
    deleteMember: (groupId: string, userId: string) => AxiosPromise<void>
  }
}

export const graph = (baseURI: string, axiosClient: AxiosInstance): Graph => {
  const url = new URL(baseURI)
  url.pathname = [...url.pathname.split('/'), 'graph', 'v1.0'].filter(Boolean).join('/')
  const config = new Configuration({
    basePath: url.href
  })

  const meDrivesApi = new MeDrivesApi(config, config.basePath, axiosClient)
  const allDrivesApi = new DrivesGetDrivesApi(config, config.basePath, axiosClient)
  const meUserApiFactory = MeUserApiFactory(config, config.basePath, axiosClient)
  const meChangepasswordApiFactory = MeChangepasswordApiFactory(
    config,
    config.basePath,
    axiosClient
  )
  const applicationsApiFactory = ApplicationsApiFactory(config, config.basePath, axiosClient)
  const userApiFactory = UserApiFactory(config, config.basePath, axiosClient)
  const usersApiFactory = UsersApiFactory(config, config.basePath, axiosClient)
  const userAppRoleAssignmentApiFactory = UserAppRoleAssignmentApiFactory(
    config,
    config.basePath,
    axiosClient
  )
  const groupApiFactory = GroupApiFactory(config, config.basePath, axiosClient)
  const groupsApiFactory = GroupsApiFactory(config, config.basePath, axiosClient)
  const drivesApiFactory = DrivesApiFactory(config, config.basePath, axiosClient)
  const tagsApiFactory = TagsApiFactory(config, config.basePath, axiosClient)

  return <Graph>{
    applications: {
      listApplications: () => applicationsApiFactory.listApplications()
    },
    tags: {
      getTags: () => tagsApiFactory.getTags(),
      assignTags: (tagAssignment: TagAssignment) => tagsApiFactory.assignTags(tagAssignment),
      unassignTags: (tagUnassignment: TagUnassignment) =>
        tagsApiFactory.unassignTags(tagUnassignment)
    },
    drives: {
      listMyDrives: (orderBy?: string, filter?: string) =>
        meDrivesApi.listMyDrives(orderBy, filter),
      listAllDrives: (orderBy?: string, filter?: string) =>
        allDrivesApi.listAllDrives(orderBy, filter),
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
        })
    },
    users: {
      getUser: (userId: string) =>
        userApiFactory.getUser(
          userId,
          new Set<any>([]),
          new Set<any>(['drive', 'memberOf', 'appRoleAssignments'])
        ),
      createUser: (user: User) => usersApiFactory.createUser(user),
      getMe: () =>
        meUserApiFactory.getOwnUser(new Set<any>(['memberOf'])).then((result) => {
          ;(result.data as any).preferredLanguage = 'en'
          return result
        }),
      changeOwnPassword: (currentPassword, newPassword) =>
        meChangepasswordApiFactory.changeOwnPassword({ currentPassword, newPassword }),
      editUser: (userId: string, user: User) =>
        userApiFactory.updateUser(userId, omit(user, ['preferredLanguage'])),
      deleteUser: (userId: string) => userApiFactory.deleteUser(userId),
      listUsers: (orderBy?: any, filter?: string) =>
        usersApiFactory.listUsers(
          '',
          filter,
          new Set<any>([orderBy]),
          new Set<any>([]),
          new Set<any>(['memberOf', 'appRoleAssignments'])
        ),
      createUserAppRoleAssignment: (userId: string, appRoleAssignment: AppRoleAssignment) =>
        userAppRoleAssignmentApiFactory.userCreateAppRoleAssignments(userId, appRoleAssignment),
      exportPersonalData: (userId: string, exportPersonalDataRequest?: ExportPersonalDataRequest) =>
        userApiFactory.exportPersonalData(userId, exportPersonalDataRequest)
    },
    groups: {
      createGroup: (group: Group) => groupsApiFactory.createGroup(group),
      editGroup: (groupId: string, group: Group) => groupApiFactory.updateGroup(groupId, group),
      getGroup: (groupId: string) =>
        groupApiFactory.getGroup(groupId, new Set<any>([]), new Set<any>(['members'])),
      deleteGroup: (groupId: string) => groupApiFactory.deleteGroup(groupId),
      listGroups: (orderBy?: any) =>
        groupsApiFactory.listGroups(
          '',
          new Set<any>([orderBy]),
          new Set<any>([]),
          new Set<any>(['members'])
        ),
      addMember: (groupId: string, userId: string, server: string) =>
        groupApiFactory.addMember(groupId, { '@odata.id': `${server}graph/v1.0/users/${userId}` }),
      deleteMember: (groupId: string, userId: string) =>
        groupApiFactory.deleteMember(groupId, userId)
    }
  }
}

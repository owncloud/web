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
  UsersApiFactory
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
    createUser: (user: User) => AxiosPromise<User>
    getMe: () => AxiosPromise<User>
    changeOwnPassword: (currentPassword: string, newPassword: string) => AxiosPromise<void>
    editUser: (userId: string, user: User) => AxiosPromise<User>
    deleteUser: (userId: string) => AxiosPromise<void>
    listUsers: (orderBy?: string) => AxiosPromise<CollectionOfUser>
  }
  groups: {
    listGroups: (orderBy?: string) => AxiosPromise<CollectionOfGroup>
    createGroup: (group: Group) => AxiosPromise<Group>
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
  const meUserApiFactory = MeUserApiFactory(config, config.basePath, axiosClient)
  const meChangepasswordApiFactory = MeChangepasswordApiFactory(
    config,
    config.basePath,
    axiosClient
  )
  const userApiFactory = UserApiFactory(config, config.basePath, axiosClient)
  const usersApiFactory = UsersApiFactory(config, config.basePath, axiosClient)
  const groupApiFactory = GroupApiFactory(config, config.basePath, axiosClient)
  const groupsApiFactory = GroupsApiFactory(config, config.basePath, axiosClient)
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
      getUser: (userId: string) =>
        userApiFactory.getUser(userId, new Set<any>([]), new Set<any>(['drive'])),
      createUser: (user: User) => usersApiFactory.createUser(user),
      getMe: () => meUserApiFactory.getOwnUser(new Set<any>(['memberOf'])),
      changeOwnPassword: (currentPassword, newPassword) =>
        meChangepasswordApiFactory.changeOwnPassword({ currentPassword, newPassword }),
      editUser: (userId: string, user: User) => userApiFactory.updateUser(userId, user),
      deleteUser: (userId: string) => userApiFactory.deleteUser(userId),
      listUsers: (orderBy?: any) =>
        usersApiFactory.listUsers(
          0,
          0,
          '',
          '',
          false,
          new Set<any>([orderBy]),
          new Set<any>([]),
          new Set<any>(['memberOf'])
        )
    },
    groups: {
      createGroup: (group: Group) => groupsApiFactory.createGroup(group),
      editGroup: (groupId: string, group: Group) => groupApiFactory.updateGroup(groupId, group),
      deleteGroup: (groupId: string) => groupApiFactory.deleteGroup(groupId),
      listGroups: (orderBy?: any) =>
        groupsApiFactory.listGroups(
          0,
          0,
          '',
          '',
          false,
          new Set<any>([orderBy]),
          new Set<any>([]),
          new Set<any>(['members'])
        ),
      addMember: (groupId: string, userId: string, server: string) => {
        groupApiFactory.addMember(groupId, { '@odata.id': `${server}graph/v1.0/users/${userId}` })
      },
      deleteMember: (groupId: string, userId: string) => {
        groupApiFactory.deleteMember(groupId, userId)
      }
    }
  }
}

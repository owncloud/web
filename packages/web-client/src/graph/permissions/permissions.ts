import {
  buildCollaboratorShare,
  buildLinkShare,
  CollaboratorShare,
  LinkShare,
  ShareRole
} from '../../helpers'
import {
  CollectionOfPermissionsWithAllowedValues,
  DrivesPermissionsApiFactory,
  DrivesRootApiFactory,
  Permission,
  RoleManagementApiFactory,
  UnifiedRoleDefinition
} from './../generated'
import type { GraphFactoryOptions, GraphRequestOptions } from './../types'
import type { GraphPermissions } from './types'

export const PermissionsFactory = ({
  axiosClient,
  config
}: GraphFactoryOptions): GraphPermissions => {
  const drivesRootApiFactory = DrivesRootApiFactory(config, config.basePath, axiosClient)
  const roleManagementApiFactory = RoleManagementApiFactory(config, config.basePath, axiosClient)
  const drivesPermissionsApiFactory = DrivesPermissionsApiFactory(
    config,
    config.basePath,
    axiosClient
  )

  return {
    async getPermission<T extends CollaboratorShare | LinkShare>(
      driveId: string,
      itemId: string,
      permId: string,
      graphRoles: Record<string, ShareRole>,
      requestOptions: GraphRequestOptions
    ): Promise<T> {
      const { data: permission } = await drivesPermissionsApiFactory.getPermission(
        driveId,
        itemId,
        permId,
        requestOptions
      )

      if (permission.link) {
        return buildLinkShare({ graphPermission: permission, resourceId: itemId }) as T
      }

      return buildCollaboratorShare({
        graphPermission: permission,
        resourceId: itemId,
        graphRoles: graphRoles || {}
      }) as T
    },

    async listPermissions(driveId, itemId, graphRoles, options, requestOptions) {
      let responseData: CollectionOfPermissionsWithAllowedValues

      if (driveId === itemId) {
        const { data } = await drivesRootApiFactory.listPermissionsSpaceRoot(
          driveId,
          options?.filter,
          options?.select ? new Set([...options.select]) : null,
          requestOptions
        )
        responseData = data
      } else {
        const { data } = await drivesPermissionsApiFactory.listPermissions(
          driveId,
          itemId,
          options?.filter,
          options?.select ? new Set([...options.select]) : null,
          requestOptions
        )
        responseData = data
      }

      const permissions = responseData.value || []
      const allowedActions = responseData['@libre.graph.permissions.actions.allowedValues']
      const allowedRoles = responseData['@libre.graph.permissions.roles.allowedValues']

      const shares = permissions.map((permission) => {
        if (permission.link) {
          return buildLinkShare({ graphPermission: permission, resourceId: itemId })
        }

        return buildCollaboratorShare({
          graphPermission: permission,
          resourceId: itemId,
          graphRoles: graphRoles || {}
        })
      })

      return { shares, allowedActions, allowedRoles }
    },

    async updatePermission<T extends CollaboratorShare | LinkShare>(
      driveId: string,
      itemId: string,
      permId: string,
      data: Permission,
      graphRoles: Record<string, ShareRole>,
      requestOptions: GraphRequestOptions
    ): Promise<T> {
      let permission: Permission

      if (driveId === itemId) {
        const { data: perm } = await drivesRootApiFactory.updatePermissionSpaceRoot(
          driveId,
          permId,
          data,
          requestOptions
        )

        permission = perm
      } else {
        const { data: perm } = await drivesPermissionsApiFactory.updatePermission(
          driveId,
          itemId,
          permId,
          data,
          requestOptions
        )

        permission = perm
      }

      if (permission.link) {
        return buildLinkShare({ graphPermission: permission, resourceId: itemId }) as T
      }

      return buildCollaboratorShare({
        graphPermission: permission,
        resourceId: itemId,
        graphRoles: graphRoles || {}
      }) as T
    },

    async deletePermission(driveId, itemId, permId, requestOptions) {
      if (driveId === itemId) {
        await drivesRootApiFactory.deletePermissionSpaceRoot(driveId, permId, requestOptions)
        return
      }

      await drivesPermissionsApiFactory.deletePermission(driveId, itemId, permId, requestOptions)
    },

    async createInvite(driveId, itemId, data, graphRoles, requestOptions) {
      let permission: Permission | undefined

      if (driveId === itemId) {
        const { data: perm } = await drivesRootApiFactory.inviteSpaceRoot(
          driveId,
          data,
          requestOptions
        )

        permission = perm.value?.[0]
      } else {
        const { data: perm } = await drivesPermissionsApiFactory.invite(
          driveId,
          itemId,
          data,
          requestOptions
        )

        permission = perm.value?.[0]
      }

      if (!permission) {
        throw new Error('no permission returned')
      }

      return buildCollaboratorShare({
        graphPermission: permission,
        resourceId: itemId,
        graphRoles: graphRoles || {}
      })
    },

    async createLink(driveId, itemId, data, requestOptions) {
      let permission: Permission

      if (driveId === itemId) {
        const { data: perm } = await drivesRootApiFactory.createLinkSpaceRoot(
          driveId,
          data,
          requestOptions
        )

        permission = perm
      } else {
        const { data: perm } = await drivesPermissionsApiFactory.createLink(
          driveId,
          itemId,
          data,
          requestOptions
        )

        permission = perm
      }

      return buildLinkShare({ graphPermission: permission, resourceId: itemId })
    },

    async setPermissionPassword(driveId, itemId, permId, data, requestOptions) {
      let permission: Permission

      if (driveId === itemId) {
        const { data: perm } = await drivesRootApiFactory.setPermissionPasswordSpaceRoot(
          driveId,
          permId,
          data,
          requestOptions
        )

        permission = perm
      } else {
        const { data: perm } = await drivesPermissionsApiFactory.setPermissionPassword(
          driveId,
          itemId,
          permId,
          data,
          requestOptions
        )

        permission = perm
      }

      return buildLinkShare({ graphPermission: permission, resourceId: itemId })
    },

    async listRoleDefinitions(requestOptions) {
      // const { data } = await roleManagementApiFactory.listPermissionRoleDefinitions(requestOptions)
      const data = [
        {
          '@libre.graph.weight': 0,
          description: 'View and download.',
          displayName: 'Can view',
          id: 'b1e2218d-eef8-4d4c-b82d-0f1a1b48f3b5',
          rolePermissions: [
            {
              allowedResourceActions: [
                'libre.graph/driveItem/path/read',
                'libre.graph/driveItem/quota/read',
                'libre.graph/driveItem/content/read',
                'libre.graph/driveItem/children/read',
                'libre.graph/driveItem/deleted/read',
                'libre.graph/driveItem/basic/read'
              ],
              condition: 'exists @Resource.File'
            },
            {
              allowedResourceActions: [
                'libre.graph/driveItem/path/read',
                'libre.graph/driveItem/quota/read',
                'libre.graph/driveItem/content/read',
                'libre.graph/driveItem/children/read',
                'libre.graph/driveItem/deleted/read',
                'libre.graph/driveItem/basic/read'
              ],
              condition: 'exists @Resource.Folder'
            },
            {
              allowedResourceActions: [
                'libre.graph/driveItem/path/read',
                'libre.graph/driveItem/quota/read',
                'libre.graph/driveItem/content/read',
                'libre.graph/driveItem/children/read',
                'libre.graph/driveItem/deleted/read',
                'libre.graph/driveItem/basic/read'
              ],
              condition: 'exists @Resource.File \u0026\u0026 @Subject.UserType=="Federated"'
            },
            {
              allowedResourceActions: [
                'libre.graph/driveItem/path/read',
                'libre.graph/driveItem/quota/read',
                'libre.graph/driveItem/content/read',
                'libre.graph/driveItem/children/read',
                'libre.graph/driveItem/deleted/read',
                'libre.graph/driveItem/basic/read'
              ],
              condition: 'exists @Resource.Folder \u0026\u0026 @Subject.UserType=="Federated"'
            }
          ]
        },
        {
          '@libre.graph.weight': 0,
          description: 'View and download.',
          displayName: 'Can view',
          id: 'a8d5fe5e-96e3-418d-825b-534dbdf22b99',
          rolePermissions: [
            {
              allowedResourceActions: [
                'libre.graph/driveItem/path/read',
                'libre.graph/driveItem/quota/read',
                'libre.graph/driveItem/content/read',
                'libre.graph/driveItem/permissions/read',
                'libre.graph/driveItem/children/read',
                'libre.graph/driveItem/deleted/read',
                'libre.graph/driveItem/basic/read'
              ],
              condition: 'exists @Resource.Root'
            }
          ]
        },
        {
          '@libre.graph.weight': 0,
          description: 'View, download, upload, edit, add and delete.',
          displayName: 'Can edit without versions',
          id: 'fb6c3e19-e378-47e5-b277-9732f9de6e21',
          rolePermissions: [
            {
              allowedResourceActions: [
                'libre.graph/driveItem/children/create',
                'libre.graph/driveItem/standard/delete',
                'libre.graph/driveItem/path/read',
                'libre.graph/driveItem/quota/read',
                'libre.graph/driveItem/content/read',
                'libre.graph/driveItem/upload/create',
                'libre.graph/driveItem/children/read',
                'libre.graph/driveItem/deleted/read',
                'libre.graph/driveItem/path/update',
                'libre.graph/driveItem/deleted/update',
                'libre.graph/driveItem/basic/read'
              ],
              condition: 'exists @Resource.Folder'
            },
            {
              allowedResourceActions: [
                'libre.graph/driveItem/children/create',
                'libre.graph/driveItem/standard/delete',
                'libre.graph/driveItem/path/read',
                'libre.graph/driveItem/quota/read',
                'libre.graph/driveItem/content/read',
                'libre.graph/driveItem/upload/create',
                'libre.graph/driveItem/children/read',
                'libre.graph/driveItem/deleted/read',
                'libre.graph/driveItem/path/update',
                'libre.graph/driveItem/deleted/update',
                'libre.graph/driveItem/basic/read'
              ],
              condition: 'exists @Resource.Folder \u0026\u0026 @Subject.UserType=="Federated"'
            }
          ]
        },
        {
          '@libre.graph.weight': 0,
          description: 'View, download, upload, edit, add, delete including the history.',
          displayName: 'Can edit',
          id: '58c63c02-1d89-4572-916a-870abc5a1b7d',
          rolePermissions: [
            {
              allowedResourceActions: [
                'libre.graph/driveItem/children/create',
                'libre.graph/driveItem/standard/delete',
                'libre.graph/driveItem/path/read',
                'libre.graph/driveItem/quota/read',
                'libre.graph/driveItem/content/read',
                'libre.graph/driveItem/upload/create',
                'libre.graph/driveItem/permissions/read',
                'libre.graph/driveItem/children/read',
                'libre.graph/driveItem/versions/read',
                'libre.graph/driveItem/deleted/read',
                'libre.graph/driveItem/path/update',
                'libre.graph/driveItem/versions/update',
                'libre.graph/driveItem/deleted/update',
                'libre.graph/driveItem/basic/read'
              ],
              condition: 'exists @Resource.Root'
            }
          ]
        },
        {
          '@libre.graph.weight': 0,
          description: 'View, download and edit.',
          displayName: 'Can edit without versions',
          id: '2d00ce52-1fc2-4dbc-8b95-a73b73395f5a',
          rolePermissions: [
            {
              allowedResourceActions: [
                'libre.graph/driveItem/path/read',
                'libre.graph/driveItem/quota/read',
                'libre.graph/driveItem/content/read',
                'libre.graph/driveItem/upload/create',
                'libre.graph/driveItem/children/read',
                'libre.graph/driveItem/deleted/read',
                'libre.graph/driveItem/deleted/update',
                'libre.graph/driveItem/basic/read'
              ],
              condition: 'exists @Resource.File'
            },
            {
              allowedResourceActions: [
                'libre.graph/driveItem/path/read',
                'libre.graph/driveItem/quota/read',
                'libre.graph/driveItem/content/read',
                'libre.graph/driveItem/upload/create',
                'libre.graph/driveItem/children/read',
                'libre.graph/driveItem/deleted/read',
                'libre.graph/driveItem/deleted/update',
                'libre.graph/driveItem/basic/read'
              ],
              condition: 'exists @Resource.File \u0026\u0026 @Subject.UserType=="Federated"'
            }
          ]
        },
        {
          '@libre.graph.weight': 0,
          description: 'View, download and upload.',
          displayName: 'Can upload',
          id: '1c996275-f1c9-4e71-abdf-a42f6495e960',
          rolePermissions: [
            {
              allowedResourceActions: [
                'libre.graph/driveItem/children/create',
                'libre.graph/driveItem/path/read',
                'libre.graph/driveItem/content/read',
                'libre.graph/driveItem/upload/create',
                'libre.graph/driveItem/children/read',
                'libre.graph/driveItem/path/update',
                'libre.graph/driveItem/basic/read'
              ],
              condition: 'exists @Resource.Folder'
            }
          ]
        },
        {
          '@libre.graph.weight': 0,
          description: 'View, download, upload, edit, add, delete and manage members.',
          displayName: 'Can manage',
          id: '312c0871-5ef7-4b3a-85b6-0e4074c64049',
          rolePermissions: [
            {
              allowedResourceActions: [
                'libre.graph/driveItem/permissions/create',
                'libre.graph/driveItem/children/create',
                'libre.graph/driveItem/standard/delete',
                'libre.graph/driveItem/path/read',
                'libre.graph/driveItem/quota/read',
                'libre.graph/driveItem/content/read',
                'libre.graph/driveItem/upload/create',
                'libre.graph/driveItem/permissions/read',
                'libre.graph/driveItem/children/read',
                'libre.graph/driveItem/versions/read',
                'libre.graph/driveItem/deleted/read',
                'libre.graph/driveItem/path/update',
                'libre.graph/driveItem/permissions/delete',
                'libre.graph/driveItem/deleted/delete',
                'libre.graph/driveItem/versions/update',
                'libre.graph/driveItem/deleted/update',
                'libre.graph/driveItem/basic/read',
                'libre.graph/driveItem/permissions/update',
                'libre.graph/driveItem/permissions/deny'
              ],
              condition: 'exists @Resource.Root'
            }
          ]
        }
      ]

      // FIXME: graph type is wrong
      return data as Promise<UnifiedRoleDefinition[]>
    }
  }
}

import { buildCollaboratorShare, buildLinkShare, CollaboratorShare, LinkShare } from '../../helpers'
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
      graphRoles: UnifiedRoleDefinition[],
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
        graphRoles: graphRoles || []
      }) as T
    },

    async listPermissions(driveId, itemId, isSpaceRoot, graphRoles, requestOptions) {
      let responseData: CollectionOfPermissionsWithAllowedValues

      if (isSpaceRoot) {
        const { data } = await drivesRootApiFactory.listPermissionsSpaceRoot(
          driveId,
          requestOptions
        )
        responseData = data
      } else {
        const { data } = await drivesPermissionsApiFactory.listPermissions(
          driveId,
          itemId,
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
          graphRoles: graphRoles || []
        })
      })

      return { shares, allowedActions, allowedRoles }
    },

    async updatePermission<T extends CollaboratorShare | LinkShare>(
      driveId: string,
      itemId: string,
      permId: string,
      data: Permission,
      isSpaceRoot: boolean,
      graphRoles: UnifiedRoleDefinition[],
      requestOptions: GraphRequestOptions
    ): Promise<T> {
      let permission: Permission

      if (isSpaceRoot) {
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
        graphRoles: graphRoles || []
      }) as T
    },

    async deletePermission(driveId, itemId, permId, isSpaceRoot, requestOptions) {
      if (isSpaceRoot) {
        await drivesRootApiFactory.deletePermissionSpaceRoot(driveId, permId, requestOptions)
        return
      }

      await drivesPermissionsApiFactory.deletePermission(driveId, itemId, permId, requestOptions)
    },

    async createInvite(driveId, itemId, data, isSpaceRoot, graphRoles, requestOptions) {
      let permission: Permission | undefined

      if (isSpaceRoot) {
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
        graphRoles: graphRoles || []
      })
    },

    async createLink(driveId, itemId, data, isSpaceRoot, requestOptions) {
      let permission: Permission

      if (isSpaceRoot) {
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

    async setPermissionPassword(driveId, itemId, permId, data, isSpaceRoot, requestOptions) {
      let permission: Permission

      if (isSpaceRoot) {
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
      const { data } = await roleManagementApiFactory.listPermissionRoleDefinitions(requestOptions)

      // FIXME: graph type is wrong
      return data as Promise<UnifiedRoleDefinition[]>
    }
  }
}

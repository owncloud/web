import {
  CollaboratorShare,
  LinkShare,
  Share,
  ShareRole,
  ShareTypes,
  isProjectSpaceResource,
  isSpaceResource
} from '@ownclouders/web-client'
import { defineStore } from 'pinia'
import { Ref, ref, unref } from 'vue'
import { AxiosResponse } from 'axios'
import {
  AddLinkOptions,
  AddShareOptions,
  DeleteLinkOptions,
  DeleteShareOptions,
  UpdateLinkOptions,
  UpdateShareOptions
} from './types'
import { useResourcesStore } from '../resources'
import { useThemeStore } from '../theme'
import { Permission, UnifiedRoleDefinition } from '@ownclouders/web-client/graph/generated'
import { useUserStore } from '../user'
import { buildLinkShare, buildCollaboratorShare } from '@ownclouders/web-client'

export const useSharesStore = defineStore('shares', () => {
  const resourcesStore = useResourcesStore()
  const userStore = useUserStore()
  const { getRoleIcon: getThemeRoleIcon } = useThemeStore()
  const loading = ref(false)
  const collaboratorShares = ref<CollaboratorShare[]>([]) as Ref<CollaboratorShare[]>
  const linkShares = ref<LinkShare[]>([]) as Ref<LinkShare[]>
  const graphRoles = ref<ShareRole[]>([]) as Ref<ShareRole[]>

  const setGraphRoles = (values: UnifiedRoleDefinition[]) => {
    graphRoles.value = values.map((v) => ({
      ...v,
      icon: getThemeRoleIcon(v)
    }))
  }

  const upsertCollaboratorShare = (share: CollaboratorShare) => {
    const existingShare = unref(collaboratorShares).find(({ id }) => id === share.id)

    if (existingShare) {
      Object.assign(existingShare, share)
      return
    }

    unref(collaboratorShares).push(share)
  }

  const setCollaboratorShares = (values: CollaboratorShare[]) => {
    collaboratorShares.value = values
  }

  const addCollaboratorShares = (values: CollaboratorShare[]) => {
    unref(collaboratorShares).push(...values)
  }

  const removeCollaboratorShare = (share: CollaboratorShare) => {
    collaboratorShares.value = unref(collaboratorShares).filter(({ id }) => id !== share.id)
  }

  const pruneShares = () => {
    collaboratorShares.value = []
    linkShares.value = []
    loading.value = undefined
  }

  // remove loaded shares that are not within the current path
  const removeOrphanedShares = () => {
    const ancestorIds = Object.values(resourcesStore.ancestorMetaData).map(({ id }) => id)

    if (!ancestorIds.length) {
      collaboratorShares.value = []
      linkShares.value = []
      return
    }

    unref(collaboratorShares).forEach((share) => {
      if (!ancestorIds.includes(share.resourceId)) {
        removeCollaboratorShare(share)
      }
    })

    unref(linkShares).forEach((share) => {
      if (!ancestorIds.includes(share.resourceId)) {
        removeLinkShare(share)
      }
    })
  }

  const setLinkShares = (values: LinkShare[]) => {
    linkShares.value = values
  }

  const upsertLinkShare = (share: LinkShare) => {
    const existingShare = unref(linkShares).find(({ id }) => id === share.id)

    if (existingShare) {
      Object.assign(existingShare, share)
      return
    }

    unref(linkShares).push(share)
  }

  const removeLinkShare = (share: LinkShare) => {
    linkShares.value = unref(linkShares).filter(({ id }) => id !== share.id)
  }

  const setLoading = (value: boolean) => {
    loading.value = value
  }

  const updateFileShareTypes = (id: string) => {
    const computeShareTypes = (shares: Share[]) => {
      const shareTypes = new Set<number>()
      shares.forEach((share) => {
        shareTypes.add(share.shareType)
      })
      return Array.from(shareTypes)
    }

    const file = [...resourcesStore.resources, resourcesStore.currentFolder].find(
      (f) => f?.id === id
    )
    if (!file || isProjectSpaceResource(file)) {
      return
    }

    const allShares = [...unref(collaboratorShares), ...unref(linkShares)]
    resourcesStore.updateResourceField({
      id: file.id,
      field: 'shareTypes',
      value: computeShareTypes(allShares.filter((s) => !s.indirect))
    })

    const ancestorEntry = Object.values(resourcesStore.ancestorMetaData).find((a) => a.id === id)
    if (ancestorEntry) {
      resourcesStore.updateAncestorField({
        path: ancestorEntry.path,
        field: 'shareTypes',
        value: computeShareTypes(allShares.filter((s) => !s.indirect))
      })
    }
  }

  const addShare = async ({
    clientService,
    space,
    resource,
    options
  }: AddShareOptions): Promise<CollaboratorShare[]> => {
    const client = clientService.graphAuthenticated.permissions
    let permissions: Permission[] = []

    if (isSpaceResource(resource)) {
      const {
        data: { value }
      } = await client.inviteSpaceRoot(space.id, options)
      permissions = value
    } else {
      const {
        data: { value }
      } = await client.invite(space.id, resource.id, options)
      permissions = value
    }

    const builtShares: CollaboratorShare[] = []

    permissions.forEach((graphPermission) => {
      builtShares.push(
        buildCollaboratorShare({
          graphPermission,
          graphRoles: unref(graphRoles),
          resourceId: resource.id,
          user: userStore.user
        })
      )
    })

    addCollaboratorShares(builtShares)
    updateFileShareTypes(resource.id)
    resourcesStore.loadIndicators(space, resource.id)
    return builtShares
  }

  const updateShare = async ({
    clientService,
    space,
    resource,
    collaboratorShare,
    options
  }: UpdateShareOptions) => {
    const client = clientService.graphAuthenticated.permissions
    let permission: Permission

    const payload = {
      roles: options.roles,
      expirationDateTime: options.expirationDateTime
    } satisfies Permission

    if (isSpaceResource(resource)) {
      const { data } = await client.updatePermissionSpaceRoot(
        space.id,
        collaboratorShare.id,
        payload
      )
      permission = data
    } else {
      const { data } = await client.updatePermission(
        space.id,
        resource.id,
        collaboratorShare.id,
        payload
      )
      permission = data
    }

    const share = buildCollaboratorShare({
      graphPermission: permission,
      graphRoles: unref(graphRoles),
      resourceId: resource.id,
      user: userStore.user
    })
    upsertCollaboratorShare(share)
    return share
  }

  const deleteShare = async ({
    clientService,
    space,
    resource,
    collaboratorShare,
    loadIndicators = false
  }: DeleteShareOptions) => {
    const client = clientService.graphAuthenticated.permissions

    if (isSpaceResource(resource)) {
      await client.deletePermissionSpaceRoot(space.id, collaboratorShare.id)
    } else {
      await client.deletePermission(space.id, resource.id, collaboratorShare.id)
    }

    removeCollaboratorShare(collaboratorShare)
    updateFileShareTypes(resource.id)
    if (loadIndicators) {
      resourcesStore.loadIndicators(space, resource.id)
    }
  }

  const addLink = async ({ clientService, space, resource, options }: AddLinkOptions) => {
    const client = clientService.graphAuthenticated.permissions
    let permission: Permission

    if (isSpaceResource(resource)) {
      const { data } = await client.createLinkSpaceRoot(space.id, options)
      permission = data
    } else {
      const { data } = await client.createLink(space.id, resource.id, options)
      permission = data
    }

    const link = buildLinkShare({
      graphPermission: permission,
      user: userStore.user,
      resourceId: resource.id
    })

    const selectedFiles = resourcesStore.selectedResources
    const fileIsSelected =
      selectedFiles.some(({ fileId }) => fileId === resource.fileId) ||
      (selectedFiles.length === 0 && resourcesStore.currentFolder.fileId === resource.fileId)

    upsertLinkShare(link)
    updateFileShareTypes(resource.id)

    if (!fileIsSelected) {
      // we might need to update the share types for the ancestor resource as well
      const ancestor = resourcesStore.ancestorMetaData[resource.path] ?? null
      if (ancestor) {
        const { shareTypes } = ancestor
        if (!shareTypes.includes(ShareTypes.link.value)) {
          resourcesStore.updateAncestorField({
            path: ancestor.path,
            field: 'shareTypes',
            value: [...shareTypes, ShareTypes.link.value]
          })
        }
      }
    }

    resourcesStore.loadIndicators(space, resource.id)
    return link
  }

  const updateLink = async ({
    clientService,
    space,
    resource,
    linkShare,
    options
  }: UpdateLinkOptions) => {
    const client = clientService.graphAuthenticated.permissions
    let response: AxiosResponse<Permission>

    if (Object.hasOwn(options, 'password')) {
      if (isSpaceResource(resource)) {
        response = await client.setPermissionPasswordSpaceRoot(space.id, linkShare.id, {
          password: options.password
        })
      } else {
        response = await client.setPermissionPassword(space.id, resource.id, linkShare.id, {
          password: options.password
        })
      }

      linkShare.hasPassword = !!options.password
    } else {
      const payload = {
        link: {
          ...(options.type && { type: options.type }),
          ...(options.displayName && {
            '@libre.graph.displayName': options.displayName
          })
        },
        expirationDateTime: options.expirationDateTime
      } satisfies Permission

      if (isSpaceResource(resource)) {
        response = await client.updatePermissionSpaceRoot(space.id, linkShare.id, payload)
      } else {
        response = await client.updatePermission(space.id, resource.id, linkShare.id, payload)
      }
    }

    const link = buildLinkShare({
      graphPermission: response.data,
      user: userStore.user,
      resourceId: resource.id
    })
    upsertLinkShare(link)
    return link
  }

  const deleteLink = async ({
    clientService,
    space,
    resource,
    linkShare,
    loadIndicators = false
  }: DeleteLinkOptions) => {
    const client = clientService.graphAuthenticated.permissions

    if (isSpaceResource(resource)) {
      await client.deletePermissionSpaceRoot(space.id, linkShare.id)
    } else {
      await client.deletePermission(space.id, resource.id, linkShare.id)
    }

    removeLinkShare(linkShare)
    updateFileShareTypes(resource.id)
    if (loadIndicators) {
      resourcesStore.loadIndicators(space, resource.id)
    }
  }

  return {
    loading,
    collaboratorShares,
    linkShares,
    graphRoles,

    setGraphRoles,
    setLoading,
    setCollaboratorShares,
    setLinkShares,
    removeOrphanedShares,

    pruneShares,
    addShare,
    updateShare,
    deleteShare,

    addLink,
    updateLink,
    deleteLink
  }
})

export type SharesStore = ReturnType<typeof useSharesStore>

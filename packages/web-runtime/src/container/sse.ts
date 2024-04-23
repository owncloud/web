import {
  ClientService,
  createFileRouteOptions,
  eventBus,
  getIndicators,
  ImageDimension,
  isLocationSharesActive,
  isLocationSpacesActive,
  MessageStore,
  PreviewService,
  ResourcesStore,
  SharesStore,
  SpacesStore,
  UserStore
} from '@ownclouders/web-pkg'
import PQueue from 'p-queue'
import {
  buildIncomingShareResource,
  buildOutgoingShareResource,
  buildSpace,
  extractNodeId,
  ShareTypes
} from '@ownclouders/web-client'
import { z } from 'zod'
import { Router } from 'vue-router'
import { Language } from 'vue3-gettext'

const eventSchema = z.object({
  itemid: z.string(),
  parentitemid: z.string(),
  spaceid: z.string().optional(),
  initiatorid: z.string().optional(),
  etag: z.string().optional(),
  affecteduserids: z.array(z.string()).optional().nullable()
})

export type EventSchemaType = z.infer<typeof eventSchema>

export interface SseEventOptions {
  resourcesStore: ResourcesStore
  spacesStore: SpacesStore
  userStore: UserStore
  messageStore: MessageStore
  sharesStore: SharesStore
  clientService: ClientService
  previewService: PreviewService
  router: Router
  language: Language
  resourceQueue: PQueue
  sseData: EventSchemaType
}

export interface SseEventWrapperOptions extends Omit<SseEventOptions, 'sseData'> {
  msg: MessageEvent
  topic: string
  method: (options: SseEventOptions) => Promise<unknown> | unknown
}

export const sseEventWrapper = (options: SseEventWrapperOptions) => {
  const { topic, msg, method, ...sseEventOptions } = options
  try {
    const sseData = eventSchema.parse(JSON.parse(msg.data))
    console.debug(`SSE event '${topic}'`, sseData)

    return method({ ...sseEventOptions, sseData })
  } catch (e) {
    console.error(`Unable to process sse event ${topic} data`, e)
  }
}

const itemInCurrentFolder = ({
  resourcesStore,
  parentFolderId
}: {
  resourcesStore: ResourcesStore
  parentFolderId: string
}) => {
  const currentFolder = resourcesStore.currentFolder
  if (!currentFolder) {
    return false
  }

  if (!extractNodeId(currentFolder.id)) {
    // if we don't have a nodeId here, we have a space (root) as current folder and can only check against the storageId
    const spaceNodeId = currentFolder.id.split('$')[1]
    if (`${currentFolder.id}!${spaceNodeId}` !== parentFolderId) {
      return false
    }
  } else {
    if (currentFolder.id !== parentFolderId) {
      return false
    }
  }

  return true
}

export const onSSEItemRenamedEvent = async ({
  sseData,
  resourcesStore,
  spacesStore,
  clientService,
  router
}: SseEventOptions) => {
  if (sseData.initiatorid === clientService.initiatorId) {
    // If initiated by current client (browser tab), action unnecessary. Web manages its own logic, return early.
    return
  }

  const currentFolder = resourcesStore.currentFolder
  const resourceIsCurrentFolder = currentFolder?.id === sseData.itemid
  const resource = resourceIsCurrentFolder
    ? currentFolder
    : resourcesStore.resources.find((f) => f.id === sseData.itemid)
  const space = spacesStore.spaces.find((s) => s.id === resource.storageId)

  if (!resource || !space) {
    return
  }

  const updatedResource = await clientService.webdav.getFileInfo(space, {
    fileId: sseData.itemid
  })

  if (resourceIsCurrentFolder) {
    resourcesStore.setCurrentFolder(updatedResource)
    return router.push(
      createFileRouteOptions(space, {
        path: updatedResource.path,
        fileId: updatedResource.fileId
      })
    )
  }

  resourcesStore.upsertResource(updatedResource)
}

export const onSSEFileLockingEvent = async ({
  sseData,
  resourcesStore,
  spacesStore,
  userStore,
  clientService
}: SseEventOptions) => {
  const resource = resourcesStore.resources.find((f) => f.id === sseData.itemid)
  const space = spacesStore.spaces.find((s) => s.id === resource.storageId)

  if (!resource || !space) {
    return
  }

  const updatedResource = await clientService.webdav.getFileInfo(space, {
    fileId: sseData.itemid
  })

  resourcesStore.upsertResource(updatedResource)
  resourcesStore.updateResourceField({
    id: updatedResource.id,
    field: 'indicators',
    value: getIndicators({
      space,
      resource: updatedResource,
      ancestorMetaData: resourcesStore.ancestorMetaData,
      user: userStore.user
    })
  })
}

export const onSSEProcessingFinishedEvent = async ({
  sseData,
  resourcesStore,
  spacesStore,
  clientService,
  resourceQueue,
  previewService
}: SseEventOptions) => {
  if (!itemInCurrentFolder({ resourcesStore, parentFolderId: sseData.parentitemid })) {
    return false
  }
  const resource = resourcesStore.resources.find((f) => f.id === sseData.itemid)

  /**
   * If resource is not loaded, it suggests an upload is in progress.
   */
  if (!resource) {
    if (sseData.initiatorid === clientService.initiatorId) {
      /**
       * If the upload is initiated by the current client,
       * there's no necessity to retrieve the resources again.
       */
      return
    }

    return resourceQueue.add(async () => {
      const { resource } = await clientService.webdav.listFilesById({
        fileId: sseData.itemid
      })
      resourcesStore.upsertResource(resource)
    })
  }

  /**
   * Resource not changed, don't fetch more data
   */
  if (resource.etag === sseData.etag) {
    return resourcesStore.updateResourceField({
      id: sseData.itemid,
      field: 'processing',
      value: false
    })
  }

  const space = spacesStore.spaces.find((s) => s.id === sseData.spaceid)
  if (!space) {
    return
  }

  const updatedResource = await clientService.webdav.getFileInfo(space, {
    fileId: sseData.itemid
  })
  resourcesStore.upsertResource(updatedResource)

  const preview = await previewService.loadPreview({
    resource,
    space,
    dimensions: ImageDimension.Thumbnail
  })

  if (preview) {
    resourcesStore.updateResourceField({
      id: sseData.itemid,
      field: 'thumbnail',
      value: preview
    })
  }
}

export const onSSEItemTrashedEvent = ({
  sseData,
  language,
  messageStore,
  resourcesStore,
  clientService
}: SseEventOptions) => {
  if (sseData.initiatorid === clientService.initiatorId) {
    // If initiated by current client (browser tab), action unnecessary. Web manages its own logic, return early.
    return
  }

  const currentFolder = resourcesStore.currentFolder
  const resourceIsCurrentFolder = currentFolder?.id === sseData.itemid

  if (resourceIsCurrentFolder) {
    return messageStore.showMessage({
      title: language.$gettext(
        'The folder you were accessing has been removed. Please navigate to another location.'
      )
    })
  }

  const resource = resourcesStore.resources.find((f) => f.id === sseData.itemid)

  if (!resource) {
    return
  }

  resourcesStore.removeResources([resource])
}

export const onSSEItemRestoredEvent = async ({
  sseData,
  resourcesStore,
  spacesStore,
  userStore,
  clientService
}: SseEventOptions) => {
  if (sseData.initiatorid === clientService.initiatorId) {
    // If initiated by current client (browser tab), action unnecessary. Web manages its own logic, return early.
    return
  }

  const space = spacesStore.spaces.find((space) => space.id === sseData.spaceid)
  if (!space) {
    return
  }

  const resource = await clientService.webdav.getFileInfo(space, {
    fileId: sseData.itemid
  })

  if (!resource) {
    return
  }

  if (!itemInCurrentFolder({ resourcesStore, parentFolderId: resource.parentFolderId })) {
    return false
  }

  resourcesStore.upsertResource(resource)
  resourcesStore.updateResourceField({
    id: resource.id,
    field: 'indicators',
    value: getIndicators({
      space,
      resource,
      ancestorMetaData: resourcesStore.ancestorMetaData,
      user: userStore.user
    })
  })
}

export const onSSEItemMovedEvent = async ({
  sseData,
  resourcesStore,
  spacesStore,
  userStore,
  clientService
}: SseEventOptions) => {
  if (sseData.initiatorid === clientService.initiatorId) {
    // If initiated by current client (browser tab), action unnecessary. Web manages its own logic, return early.
    return
  }

  const space = spacesStore.spaces.find((space) => space.id === sseData.spaceid)
  if (!space) {
    return
  }

  const resource = await clientService.webdav.getFileInfo(space, {
    fileId: sseData.itemid
  })

  if (!resource) {
    return
  }

  if (resource.parentFolderId !== resourcesStore.currentFolder?.id) {
    return resourcesStore.removeResources([resource])
  }

  resourcesStore.upsertResource(resource)
  resourcesStore.updateResourceField({
    id: resource.id,
    field: 'indicators',
    value: getIndicators({
      resource,
      space,
      user: userStore.user,
      ancestorMetaData: resourcesStore.ancestorMetaData
    })
  })
}

/**
 * The FileTouched event is triggered when a new empty file, such as a new text file,
 * is about to be created on the server. This event is necessary because the
 * post-processing event won't be triggered in this case.
 */
export const onSSEFileTouchedEvent = async ({
  sseData,
  resourcesStore,
  spacesStore,
  clientService
}: SseEventOptions) => {
  if (sseData.initiatorid === clientService.initiatorId) {
    // If initiated by current client (browser tab), action unnecessary. Web manages its own logic, return early.
    return
  }

  const space = spacesStore.spaces.find((space) => space.id === sseData.spaceid)
  if (!space) {
    return
  }

  const resource = await clientService.webdav.getFileInfo(space, {
    fileId: sseData.itemid
  })

  if (!resource) {
    return
  }

  if (!itemInCurrentFolder({ resourcesStore, parentFolderId: resource.parentFolderId })) {
    return false
  }

  resourcesStore.upsertResource(resource)
}

export const onSSEFolderCreatedEvent = async ({
  sseData,
  resourcesStore,
  spacesStore,
  clientService
}: SseEventOptions) => {
  if (sseData.initiatorid === clientService.initiatorId) {
    // If initiated by current client (browser tab), action unnecessary. Web manages its own logic, return early.
    return
  }

  const space = spacesStore.spaces.find((space) => space.id === sseData.spaceid)
  if (!space) {
    return
  }

  const resource = await clientService.webdav.getFileInfo(space, {
    fileId: sseData.itemid
  })

  if (!resource) {
    return
  }

  if (!itemInCurrentFolder({ resourcesStore, parentFolderId: resource.parentFolderId })) {
    return false
  }

  resourcesStore.upsertResource(resource)
}

export const onSSESpaceMemberAddedEvent = async ({
  sseData,
  resourcesStore,
  spacesStore,
  clientService,
  router
}: SseEventOptions) => {
  if (sseData.initiatorid === clientService.initiatorId) {
    // If initiated by current client (browser tab), action unnecessary. Web manages its own logic, return early.
    return
  }

  const { data } = await clientService.graphAuthenticated.drives.getDrive(sseData.itemid)
  const space = buildSpace(data)
  spacesStore.upsertSpace(space)

  if (!isLocationSpacesActive(router, 'files-spaces-projects')) {
    return
  }

  resourcesStore.upsertResource(space)
}

export const onSSESpaceMemberRemovedEvent = async ({
  sseData,
  resourcesStore,
  spacesStore,
  messageStore,
  clientService,
  language,
  userStore,
  router
}: SseEventOptions) => {
  if (sseData.initiatorid === clientService.initiatorId) {
    // If initiated by current client (browser tab), action unnecessary. Web manages its own logic, return early.
    return
  }

  if (!sseData.affecteduserids?.includes(userStore.user.id)) {
    const { data } = await clientService.graphAuthenticated.drives.listMyDrives(
      '',
      `id eq '${sseData.spaceid}'`
    )
    const space = buildSpace(data.value[0])
    return spacesStore.upsertSpace(space)
  }

  const removedSpace = spacesStore.spaces.find((space) => space.id === sseData.spaceid)
  if (!removedSpace) {
    return
  }

  spacesStore.removeSpace(removedSpace)

  if (isLocationSpacesActive(router, 'files-spaces-projects')) {
    return resourcesStore.removeResources([removedSpace])
  }

  if (
    isLocationSpacesActive(router, 'files-spaces-generic') &&
    removedSpace.id === resourcesStore.currentFolder.storageId
  ) {
    return messageStore.showMessage({
      title: language.$gettext(
        'Your access to this space has been revoked. Please navigate to another location.'
      )
    })
  }
}

export const onSSESpaceShareUpdatedEvent = async ({
  sseData,
  resourcesStore,
  spacesStore,
  clientService,
  userStore
}: SseEventOptions) => {
  if (sseData.initiatorid === clientService.initiatorId) {
    // If initiated by current client (browser tab), action unnecessary. Web manages its own logic, return early.
    return
  }

  if (
    sseData.affecteduserids?.includes(userStore.user.id) &&
    resourcesStore.currentFolder?.storageId === sseData.spaceid
  ) {
    const { data } = await clientService.graphAuthenticated.drives.getDrive(sseData.itemid)
    const space = buildSpace(data)
    spacesStore.upsertSpace(space)
    return eventBus.publish('app.files.list.load')
  }
}

export const onSSEShareCreatedEvent = async ({
  sseData,
  resourcesStore,
  spacesStore,
  sharesStore,
  userStore,
  clientService,
  router
}: SseEventOptions) => {
  if (sseData.initiatorid === clientService.initiatorId) {
    // If initiated by current client (browser tab), action unnecessary. Web manages its own logic, return early.
    return
  }

  if (itemInCurrentFolder({ resourcesStore, parentFolderId: sseData.parentitemid })) {
    const space = spacesStore.spaces.find((space) => space.id === sseData.spaceid)
    if (!space) {
      return
    }

    const resource = await clientService.webdav.getFileInfo(space, {
      fileId: sseData.itemid
    })

    resourcesStore.upsertResource(resource)
    return resourcesStore.updateResourceField({
      id: resource.id,
      field: 'indicators',
      value: getIndicators({
        space,
        resource,
        ancestorMetaData: resourcesStore.ancestorMetaData,
        user: userStore.user
      })
    })
  }

  if (sseData.spaceid === resourcesStore.currentFolder?.storageId) {
    const space = spacesStore.spaces.find((space) => space.id === sseData.spaceid)
    if (!space) {
      return
    }

    const resource = await clientService.webdav.getFileInfo(space, {
      fileId: sseData.itemid
    })

    if (resourcesStore.currentFolder.path.startsWith(resource.path)) {
      resourcesStore.clearAncestorMetaData()
      await resourcesStore.loadAncestorMetaData({
        folder: resourcesStore.currentFolder,
        space,
        client: clientService.webdav
      })

      return resourcesStore.resources.forEach((file) => {
        file.indicators = getIndicators({
          space,
          resource: file,
          ancestorMetaData: resourcesStore.ancestorMetaData,
          user: userStore.user
        })
      })
    }
  }

  if (isLocationSharesActive(router, 'files-shares-with-me')) {
    // FIXME: get drive item by id as soon as server supports it
    const { data } = await clientService.graphAuthenticated.drives.listSharedWithMe()
    const driveItem = data.value.find(({ remoteItem }) => remoteItem.id === sseData.itemid)
    if (!driveItem) {
      return
    }
    const resource = buildIncomingShareResource({ driveItem, graphRoles: sharesStore.graphRoles })
    return resourcesStore.upsertResource(resource)
  }

  if (isLocationSharesActive(router, 'files-shares-with-others')) {
    // FIXME: get drive item by id as soon as server supports it
    const { data } = await clientService.graphAuthenticated.drives.listSharedByMe()
    const driveItem = data.value.find(({ id }) => id === sseData.itemid)
    if (!driveItem) {
      return
    }
    const resource = buildOutgoingShareResource({ driveItem, user: userStore.user })
    return resourcesStore.upsertResource(resource)
  }
}
export const onSSEShareUpdatedEvent = async ({
  sseData,
  resourcesStore,
  sharesStore,
  clientService,
  userStore,
  router
}: SseEventOptions) => {
  if (sseData.initiatorid === clientService.initiatorId) {
    // If initiated by current client (browser tab), action unnecessary. Web manages its own logic, return early.
    return
  }

  if (
    sseData.affecteduserids?.includes(userStore.user.id) &&
    resourcesStore.currentFolder?.storageId === sseData.spaceid
  ) {
    return eventBus.publish('app.files.list.load')
  }

  if (isLocationSharesActive(router, 'files-shares-with-me')) {
    // FIXME: get drive item by id as soon as server supports it
    const { data } = await clientService.graphAuthenticated.drives.listSharedWithMe()
    const driveItem = data.value.find(({ remoteItem }) => remoteItem.id === sseData.itemid)
    if (!driveItem) {
      return
    }
    const resource = buildIncomingShareResource({ driveItem, graphRoles: sharesStore.graphRoles })
    return resourcesStore.upsertResource(resource)
  }
}

export const onSSEShareRemovedEvent = async ({
  sseData,
  resourcesStore,
  spacesStore,
  userStore,
  clientService,
  messageStore,
  language,
  router
}: SseEventOptions) => {
  if (sseData.initiatorid === clientService.initiatorId) {
    // If initiated by current client (browser tab), action unnecessary. Web manages its own logic, return early.
    return
  }

  if (
    sseData.affecteduserids?.includes(userStore.user.id) &&
    resourcesStore.currentFolder?.storageId === sseData.spaceid
  ) {
    return messageStore.showMessage({
      title: language.$gettext(
        'Your access to this share has been revoked. Please navigate to another location.'
      )
    })
  }

  if (itemInCurrentFolder({ resourcesStore, parentFolderId: sseData.parentitemid })) {
    const space = spacesStore.spaces.find((space) => space.id === sseData.spaceid)
    if (!space) {
      return
    }

    const resource = await clientService.webdav.getFileInfo(space, {
      fileId: sseData.itemid
    })

    resourcesStore.upsertResource(resource)
    return resourcesStore.updateResourceField({
      id: resource.id,
      field: 'indicators',
      value: getIndicators({
        space,
        resource,
        ancestorMetaData: resourcesStore.ancestorMetaData,
        user: userStore.user
      })
    })
  }

  if (sseData.spaceid === resourcesStore.currentFolder?.storageId) {
    const space = spacesStore.spaces.find((space) => space.id === sseData.spaceid)
    if (!space) {
      return
    }

    const resource = await clientService.webdav.getFileInfo(space, {
      fileId: sseData.itemid
    })

    if (resourcesStore.currentFolder.path.startsWith(resource.path)) {
      resourcesStore.clearAncestorMetaData()
      await resourcesStore.loadAncestorMetaData({
        folder: resourcesStore.currentFolder,
        space,
        client: clientService.webdav
      })

      return resourcesStore.resources.forEach((file) => {
        file.indicators = getIndicators({
          space,
          resource: file,
          ancestorMetaData: resourcesStore.ancestorMetaData,
          user: userStore.user
        })
      })
    }
  }

  if (isLocationSharesActive(router, 'files-shares-with-others')) {
    const space = spacesStore.spaces.find((space) => space.id === sseData.spaceid)
    if (!space) {
      return
    }

    const resource = await clientService.webdav.getFileInfo(space, {
      fileId: sseData.itemid
    })

    if (
      !resource.shareTypes.includes(ShareTypes.user.value) &&
      !resource.shareTypes.includes(ShareTypes.group.value)
    ) {
      return resourcesStore.removeResources([resource])
    }
  }

  if (isLocationSharesActive(router, 'files-shares-with-me')) {
    const removedShareResource = resourcesStore.resources.find((r) => r.fileId === sseData.itemid)
    if (!removedShareResource) {
      return
    }
    return resourcesStore.removeResources([removedShareResource])
  }
}

export const onSSELinkCreatedEvent = async ({
  sseData,
  resourcesStore,
  spacesStore,
  userStore,
  clientService,
  router
}: SseEventOptions) => {
  if (sseData.initiatorid === clientService.initiatorId) {
    // If initiated by current client (browser tab), action unnecessary. Web manages its own logic, return early.
    return
  }

  if (itemInCurrentFolder({ resourcesStore, parentFolderId: sseData.parentitemid })) {
    const space = spacesStore.spaces.find((space) => space.id === sseData.spaceid)
    if (!space) {
      return
    }

    const resource = await clientService.webdav.getFileInfo(space, {
      fileId: sseData.itemid
    })

    resourcesStore.upsertResource(resource)
    return resourcesStore.updateResourceField({
      id: resource.id,
      field: 'indicators',
      value: getIndicators({
        space,
        resource,
        ancestorMetaData: resourcesStore.ancestorMetaData,
        user: userStore.user
      })
    })
  }

  if (sseData.spaceid === resourcesStore.currentFolder?.storageId) {
    const space = spacesStore.spaces.find((space) => space.id === sseData.spaceid)
    if (!space) {
      return
    }

    const resource = await clientService.webdav.getFileInfo(space, {
      fileId: sseData.itemid
    })

    if (resourcesStore.currentFolder.path.startsWith(resource.path)) {
      resourcesStore.clearAncestorMetaData()
      await resourcesStore.loadAncestorMetaData({
        folder: resourcesStore.currentFolder,
        space,
        client: clientService.webdav
      })

      return resourcesStore.resources.forEach((file) => {
        file.indicators = getIndicators({
          space,
          resource: file,
          ancestorMetaData: resourcesStore.ancestorMetaData,
          user: userStore.user
        })
      })
    }
  }

  if (isLocationSharesActive(router, 'files-shares-via-link')) {
    // FIXME: get drive item by id as soon as server supports it
    const { data } = await clientService.graphAuthenticated.drives.listSharedByMe()
    const driveItem = data.value.find(({ id }) => id === sseData.itemid)
    if (!driveItem) {
      return
    }
    const resource = buildOutgoingShareResource({ driveItem, user: userStore.user })
    return resourcesStore.upsertResource(resource)
  }
}

export const onSSELinkUpdatedEvent = ({ sseData, clientService }: SseEventOptions) => {
  if (sseData.initiatorid === clientService.initiatorId) {
    // If initiated by current client (browser tab), action unnecessary. Web manages its own logic, return early.
    return
  }
}

export const onSSELinkRemovedEvent = async ({
  sseData,
  resourcesStore,
  spacesStore,
  userStore,
  clientService,
  router
}: SseEventOptions) => {
  if (sseData.initiatorid === clientService.initiatorId) {
    // If initiated by current client (browser tab), action unnecessary. Web manages its own logic, return early.
    return
  }

  const space = spacesStore.spaces.find((space) => space.id === sseData.spaceid)
  if (!space) {
    return
  }

  const resource = await clientService.webdav.getFileInfo(space, {
    fileId: sseData.itemid
  })

  if (itemInCurrentFolder({ resourcesStore, parentFolderId: sseData.parentitemid })) {
    resourcesStore.upsertResource(resource)
    resourcesStore.updateResourceField({
      id: resource.id,
      field: 'indicators',
      value: getIndicators({
        space,
        resource,
        ancestorMetaData: resourcesStore.ancestorMetaData,
        user: userStore.user
      })
    })
  }

  if (sseData.spaceid === resourcesStore.currentFolder?.storageId) {
    if (resourcesStore.currentFolder.path.startsWith(resource.path)) {
      resourcesStore.clearAncestorMetaData()
      await resourcesStore.loadAncestorMetaData({
        folder: resourcesStore.currentFolder,
        space,
        client: clientService.webdav
      })

      return resourcesStore.resources.forEach((file) => {
        file.indicators = getIndicators({
          space,
          resource: file,
          ancestorMetaData: resourcesStore.ancestorMetaData,
          user: userStore.user
        })
      })
    }
  }

  if (isLocationSharesActive(router, 'files-shares-via-link')) {
    if (!resource.shareTypes.includes(ShareTypes.link.value)) {
      return resourcesStore.removeResources([resource])
    }
  }
}

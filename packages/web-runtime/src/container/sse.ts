import {
  ClientService,
  createFileRouteOptions,
  getIndicators,
  ImageDimension,
  isLocationSpacesActive,
  MessageStore,
  PreviewService,
  ResourcesStore,
  SpacesStore,
  UserStore
} from '@ownclouders/web-pkg'
import PQueue from 'p-queue'
import { buildSpace, extractNodeId, extractStorageId } from '@ownclouders/web-client'
import { z } from 'zod'
import { Router } from 'vue-router'
import { Language } from 'vue3-gettext'

const eventSchema = z.object({
  itemid: z.string(),
  parentitemid: z.string(),
  spaceid: z.string().optional(),
  initiatorid: z.string().optional(),
  etag: z.string().optional()
})

export type EventSchemaType = z.infer<typeof eventSchema>

export interface SseEventOptions {
  resourcesStore: ResourcesStore
  spacesStore: SpacesStore
  userStore: UserStore
  messageStore: MessageStore
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
    console.error(`Unable to parse sse event ${topic} data`, e)
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
    if (currentFolder.id !== extractStorageId(parentFolderId)) {
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
  const resourceIsCurrentFolder = currentFolder.id === sseData.itemid
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
  const resourceIsCurrentFolder = currentFolder.id === sseData.itemid

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

  if (resource.parentFolderId !== resourcesStore.currentFolder.id) {
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
  router
}: SseEventOptions) => {
  if (sseData.initiatorid === clientService.initiatorId) {
    // If initiated by current client (browser tab), action unnecessary. Web manages its own logic, return early.
    return
  }

  try {
    const { data } = await clientService.graphAuthenticated.drives.listMyDrives(
      '',
      `id eq '${sseData.spaceid}'`
    )
    const space = buildSpace(data.value[0])
    return spacesStore.upsertSpace(space)
  } catch (_) {
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
}

export const onSSESpaceShareUpdatedEvent = async ({
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
}

export const onSSEShareCreatedEvent = async ({
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
}
export const onSSEShareUpdatedEvent = async ({
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
}

export const onSSEShareRemovedEvent = async ({
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
}

export const onSSELinkCreatedEvent = async ({
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
}
export const onSSELinkUpdatedEvent = async ({
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
}

export const onSSELinkRemovedEvent = async ({
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
}

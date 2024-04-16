import {
  ClientService,
  createFileRouteOptions,
  getIndicators,
  ImageDimension,
  MessageStore,
  PreviewService,
  ResourcesStore,
  SpacesStore
} from '@ownclouders/web-pkg'
import PQueue from 'p-queue'
import { extractNodeId, extractStorageId } from '@ownclouders/web-client/src/helpers'
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
  topic,
  resourcesStore,
  spacesStore,
  msg,
  clientService,
  router
}: {
  topic: string
  resourcesStore: ResourcesStore
  spacesStore: SpacesStore
  msg: MessageEvent
  clientService: ClientService
  router: Router
}) => {
  try {
    const sseData = eventSchema.parse(JSON.parse(msg.data))

    if (sseData.initiatorid === clientService.initiatorId) {
      /**
       * If the request was initiated by the current client (browser tab),
       * there's no need to proceed with the action since the web already
       * handles its own business logic. Therefore, we'll return early here.
       */
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
  } catch (e) {
    console.error(`Unable to parse sse event ${topic} data`, e)
  }
}

export const onSSEFileLockingEvent = async ({
  topic,
  resourcesStore,
  spacesStore,
  msg,
  clientService
}: {
  topic: string
  resourcesStore: ResourcesStore
  spacesStore: SpacesStore
  msg: MessageEvent
  clientService: ClientService
}) => {
  try {
    const sseData = eventSchema.parse(JSON.parse(msg.data))
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
        resource: updatedResource,
        ancestorMetaData: resourcesStore.ancestorMetaData
      })
    })
  } catch (e) {
    console.error(`Unable to parse sse event ${topic} data`, e)
  }
}

export const onSSEProcessingFinishedEvent = async ({
  topic,
  resourcesStore,
  spacesStore,
  msg,
  clientService,
  resourceQueue,
  previewService
}: {
  topic: string
  resourcesStore: ResourcesStore
  spacesStore: SpacesStore
  msg: MessageEvent
  clientService: ClientService
  resourceQueue: PQueue
  previewService: PreviewService
}) => {
  try {
    const sseData = eventSchema.parse(JSON.parse(msg.data))

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
  } catch (e) {
    console.error(`Unable to parse sse event ${topic} data`, e)
  }
}

export const onSSEItemTrashedEvent = ({
  topic,
  language,
  messageStore,
  resourcesStore,
  clientService,
  msg
}: {
  topic: string
  language: Language
  resourcesStore: ResourcesStore
  clientService: ClientService
  messageStore: MessageStore
  msg: MessageEvent
}) => {
  try {
    const sseData = eventSchema.parse(JSON.parse(msg.data))

    if (sseData.initiatorid === clientService.initiatorId) {
      /**
       * If the request was initiated by the current client (browser tab),
       * there's no need to proceed with the action since the web already
       * handles its own business logic. Therefore, we'll return early here.
       */
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
  } catch (e) {
    console.error(`Unable to parse sse event ${topic} data`, e)
  }
}

export const onSSEItemRestoredEvent = async ({
  topic,
  resourcesStore,
  spacesStore,
  msg,
  clientService
}: {
  topic: string
  resourcesStore: ResourcesStore
  spacesStore: SpacesStore
  msg: MessageEvent
  clientService: ClientService
}) => {
  try {
    const sseData = eventSchema.parse(JSON.parse(msg.data))

    if (sseData.initiatorid === clientService.initiatorId) {
      /**
       * If the request was initiated by the current client (browser tab),
       * there's no need to proceed with the action since the web already
       * handles its own business logic. Therefore, we'll return early here.
       */
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
        resource,
        ancestorMetaData: resourcesStore.ancestorMetaData
      })
    })
  } catch (e) {
    console.error(`Unable to parse sse event ${topic} data`, e)
  }
}

/**
 * The FileTouched event is triggered when a new empty file, such as a new text file,
 * is about to be created on the server. This event is necessary because the
 * post-processing event won't be triggered in this case.
 */
export const onSSEFileTouchedEvent = async ({
  topic,
  resourcesStore,
  spacesStore,
  msg,
  clientService
}: {
  topic: string
  resourcesStore: ResourcesStore
  spacesStore: SpacesStore
  msg: MessageEvent
  clientService: ClientService
}) => {
  try {
    const sseData = eventSchema.parse(JSON.parse(msg.data))

    if (sseData.initiatorid === clientService.initiatorId) {
      /**
       * If the request was initiated by the current client (browser tab),
       * there's no need to proceed with the action since the web already
       * handles its own business logic. Therefore, we'll return early here.
       */
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
  } catch (e) {
    console.error(`Unable to parse sse event ${topic} data`, e)
  }
}

export const onSSEFolderCreatedEvent = async ({
  topic,
  resourcesStore,
  spacesStore,
  msg,
  clientService
}: {
  topic: string
  resourcesStore: ResourcesStore
  spacesStore: SpacesStore
  msg: MessageEvent
  clientService: ClientService
}) => {
  try {
    const sseData = eventSchema.parse(JSON.parse(msg.data))

    if (sseData.initiatorid === clientService.initiatorId) {
      /**
       * If the request was initiated by the current client (browser tab),
       * there's no need to proceed with the action since the web already
       * handles its own business logic. Therefore, we'll return early here.
       */
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
  } catch (e) {
    console.error(`Unable to parse sse event ${topic} data`, e)
  }
}

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
  spaceid: z.string().optional()
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  clientService,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    const space = spacesStore.spaces.find((s) => s.id === resource.storageId)
    const isFileLoaded = !!resource

    if (isFileLoaded) {
      resourcesStore.updateResourceField({
        id: sseData.itemid,
        field: 'processing',
        value: false
      })

      if (space) {
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
    } else {
      // FIXME: we currently cannot do this, we need to block this for ongoing uploads and copy operations
      // when fixing revert the changelog removal
      // resourceQueue.add(async () => {
      //   const { resource } = await clientService.webdav.listFilesById({
      //     fileId: sseData.itemid
      //   })
      //   resource.path = urlJoin(currentFolder.path, resource.name)
      //   resourcesStore.upsertResource(resource)
      // })
    }
  } catch (e) {
    console.error(`Unable to parse sse event ${topic} data`, e)
  }
}

export const onSSEItemTrashedEvent = async ({
  topic,
  language,
  messageStore,
  resourcesStore,
  msg
}: {
  topic: string
  language: Language
  resourcesStore: ResourcesStore
  messageStore: MessageStore
  msg: MessageEvent
}) => {
  try {
    /**
     * TODO: Implement a mechanism to identify the client that initiated the trash event.
     * Currently, a timeout is utilized to ensure the frontend business logic execution,
     * preventing the user from being prompted to navigate to 'another location'
     * if the active current folder has been deleted.
     * If the initiating client matches the current client, no action is required.
     */
    await new Promise((resolve) => setTimeout(resolve, 500))

    const sseData = eventSchema.parse(JSON.parse(msg.data))
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

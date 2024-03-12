import {
  ClientService,
  createFileRouteOptions,
  getIndicators,
  ImageDimension,
  PreviewService,
  ResourcesStore,
  SpacesStore
} from '@ownclouders/web-pkg'
import PQueue from 'p-queue'
import { extractNodeId, extractStorageId } from '@ownclouders/web-client/src/helpers'
import { z } from 'zod'
import { Router } from 'vue-router'

const fileReadyEventSchema = z.object({
  itemid: z.string(),
  parentitemid: z.string(),
  spaceid: z.string().optional()
})

type SSEMessageData = {
  itemid?: string
  parentitemid?: string
  spaceid?: string
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
    const sseData = fileReadyEventSchema.parse(JSON.parse(msg.data))
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
    const sseData = fileReadyEventSchema.parse(JSON.parse(msg.data))
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
    const sseData = fileReadyEventSchema.parse(JSON.parse(msg.data))

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

export const onSSEItemTrashedEvent = ({
  topic,
  resourcesStore,
  msg
}: {
  topic: string
  resourcesStore: ResourcesStore
  msg: MessageEvent
}) => {
  try {
    const sseData = fileReadyEventSchema.parse(JSON.parse(msg.data))
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
    const sseData = fileReadyEventSchema.parse(JSON.parse(msg.data))
    console.log(sseData.spaceid)
    console.log(spacesStore.spaces)
    const space = spacesStore.spaces.find((space) => space.id === sseData.spaceid)
    console.log(space)
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

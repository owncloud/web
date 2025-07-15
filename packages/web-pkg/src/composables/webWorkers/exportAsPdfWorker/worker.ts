import { DavProperty } from '@ownclouders/web-client/webdav'
import { webdav, HttpError, Resource, SpaceResource, urlJoin } from '@ownclouders/web-client'

import { WorkerTopic } from '../../piniaStores/webWorkers'
import { resolveFileNameDuplicate } from '../../../helpers/resource/conflictHandling/conflictUtils'
import { convertMarkdownToPdf } from './renderer'

type MessageData = {
  accessToken?: string
  baseUrl?: string
  headers?: Record<string, string>
  destinationFolder?: Resource
  space?: SpaceResource
  fileName?: string
  content?: string
}

type Message = {
  topic: WorkerTopic
  data: MessageData
}

let storedHeaders: Record<string, string>

self.onmessage = async (event: MessageEvent) => {
  const { topic, data } = JSON.parse(event.data) as Message

  if (topic === 'tokenUpdate' && storedHeaders) {
    const existingToken = storedHeaders.Authorization

    if (existingToken?.toString().startsWith('Bearer')) {
      storedHeaders.Authorization = data.accessToken
    }

    return
  }

  const { baseUrl, headers, destinationFolder, space, content } = data
  let { fileName } = data

  storedHeaders = headers
  const webdavService = webdav(
    baseUrl,
    () => {},
    () => storedHeaders
  )

  try {
    const { children: existingResources } = await webdavService.listFiles(
      space,
      {
        fileId: destinationFolder.fileId
      },
      { davProperties: [DavProperty.Name] }
    )

    const resourceAlreadyExists = existingResources.find(
      (existingResource) => existingResource.name === fileName
    )

    if (resourceAlreadyExists) {
      fileName = resolveFileNameDuplicate(fileName, 'pdf', existingResources)
    }

    const resource = await webdavService.putFileContents(space, {
      fileName,
      parentFolderId: destinationFolder.id,
      content: await convertMarkdownToPdf(content),
      path: urlJoin(destinationFolder.path, fileName)
    })

    postMessage(JSON.stringify({ successful: [resource], failed: [] }))
  } catch (e) {
    const error = {
      message: e.message || 'Unexpected error',
      statusCode: e instanceof HttpError ? e.statusCode : 500,
      xReqId: e instanceof HttpError ? e.response?.headers?.get('x-request-id') : undefined
    }
    postMessage(
      JSON.stringify({
        successful: [],
        failed: [
          {
            resourceName: fileName,
            error
          }
        ]
      })
    )
  }
}

import axios, { type AxiosInstance } from 'axios'
import PQueue from 'p-queue'
import { dirname } from 'path'
import { client, urlJoin } from '@ownclouders/web-client'
import type { Resource, SpaceResource } from '@ownclouders/web-client'
import type { WorkerTopic } from '../../piniaStores/webWorkers'
import type { WebDAV } from '@ownclouders/web-client/webdav'
import type { RestoreWorkerReturnData } from './useRestoreWorker'

type MessageData = {
  baseUrl?: string
  accessToken?: string
  headers?: Record<string, string>
  space?: SpaceResource
  resources?: Resource[]
  missingFolderPaths?: string[]
}

type Message = {
  topic: WorkerTopic
  data: MessageData
}

let axiosClient: AxiosInstance

const createFolderStructure = async ({
  client,
  space,
  path,
  existingPaths
}: {
  client: WebDAV
  space: SpaceResource
  path: string
  existingPaths: string[]
}) => {
  const pathSegments = path.split('/').filter(Boolean)
  let parentPath = ''

  for (const subFolder of pathSegments) {
    const folderPath = urlJoin(parentPath, subFolder)
    if (existingPaths.includes(folderPath)) {
      parentPath = urlJoin(parentPath, subFolder)
      continue
    }

    try {
      await client.createFolder(space, { path: folderPath })
    } catch (ignored) {}

    existingPaths.push(folderPath)
    parentPath = folderPath
  }

  return {
    existingPaths
  }
}

self.onmessage = async (e: MessageEvent) => {
  const { topic, data } = JSON.parse(e.data) as Message

  if (topic === 'tokenUpdate' && axiosClient) {
    const existingToken = axiosClient?.defaults.headers.Authorization

    // token must only be updated for bearer tokens, not on public links
    if (existingToken?.toString().startsWith('Bearer')) {
      Object.assign(axiosClient.defaults, { headers: { Authorization: data.accessToken } })
    }

    return
  }

  const { baseUrl, headers, space, resources, missingFolderPaths } = data

  axiosClient = axios.create({ headers })
  const { webdav } = client({ axiosClient, baseURI: baseUrl })

  const successful: RestoreWorkerReturnData['successful'] = []
  const failed: RestoreWorkerReturnData['failed'] = []
  const queue = new PQueue({ concurrency: 4 })

  let createdFolderPaths: string[] = []
  const promises = resources.map((r) => {
    return queue.add(async () => {
      const parentPath = dirname(r.path)
      if (missingFolderPaths.includes(parentPath)) {
        const { existingPaths } = await createFolderStructure({
          client: webdav,
          space,
          path: parentPath,
          existingPaths: createdFolderPaths
        })
        createdFolderPaths = existingPaths
      }

      try {
        await webdav.restoreFile(space, r, r, { overwrite: true })
        successful.push(r)
      } catch (e) {
        console.error(e)
        failed.push({
          resource: r,
          message: e.message,
          statusCode: e.statusCode,
          xReqId: e.response.headers?.get('x-request-id')
        })
      }
    })
  })

  await Promise.allSettled(promises)

  postMessage(JSON.stringify({ successful, failed }))
}

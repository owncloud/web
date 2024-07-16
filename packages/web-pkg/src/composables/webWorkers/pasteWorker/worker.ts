import axios, { type AxiosInstance } from 'axios'
import PQueue from 'p-queue'
import { join } from 'path'
import { type Resource, client } from '@ownclouders/web-client'
import type { WorkerTopic } from '../../piniaStores/webWorkers'
import { TransferType } from '../../../helpers/resource/conflictHandling/types'
import type { TransferData } from '../../../helpers/resource/conflictHandling'

type MessageData = {
  baseUrl?: string
  accessToken?: string
  headers?: Record<string, string>
  transferData?: TransferData[]
}

type Message = {
  topic: WorkerTopic
  data: MessageData
}

let axiosClient: AxiosInstance

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

  const { baseUrl, headers, transferData } = data

  axiosClient = axios.create({ headers })
  const { webdav } = client({ axiosClient, baseURI: baseUrl })

  const successful: Resource[] = []
  const failed: { resourceName: string; error: Error }[] = []
  const queue = new PQueue({ concurrency: 4 })

  const doCopy = (transferData: TransferData) =>
    webdav.copyFiles(
      transferData.sourceSpace,
      { fileId: transferData.resource.id },
      transferData.targetSpace,
      { parentFolderId: transferData.targetFolder.id, name: transferData.targetName },
      { overwrite: transferData.overwrite }
    )

  const doMove = (transferData: TransferData) =>
    webdav.moveFiles(
      transferData.sourceSpace,
      { fileId: transferData.resource.id },
      transferData.targetSpace,
      { parentFolderId: transferData.targetFolder.id, name: transferData.targetName },
      { overwrite: transferData.overwrite }
    )

  const promises = transferData.map((data) => {
    return queue.add(async () => {
      const resource = data.resource

      try {
        if (data.transferType === TransferType.COPY) {
          await doCopy(data)
          resource.id = undefined
          resource.fileId = undefined
        } else {
          await doMove(data)
        }

        resource.path = join(data.targetFolder.path, resource.name)
        resource.webDavPath = join(data.targetFolder.webDavPath, resource.name)

        successful.push(resource)
      } catch (error) {
        failed.push({ resourceName: resource.name, error })
      }
    })
  })

  await Promise.allSettled(promises)

  postMessage(JSON.stringify({ successful, failed }))
}

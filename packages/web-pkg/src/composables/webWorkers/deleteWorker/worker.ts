import axios, { type AxiosInstance } from 'axios'
import PQueue from 'p-queue'
import { type Resource, client, type SpaceResource } from '@ownclouders/web-client'
import type { DeleteWorkerTopics } from './useDeleteWorker'

type MessageData = {
  baseUrl?: string
  accessToken?: string
  headers?: Record<string, string>
  space?: SpaceResource
  resources?: Resource[]
  concurrentRequests?: number
}

type Message = {
  topic: DeleteWorkerTopics
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

  const { baseUrl, headers, space, resources, concurrentRequests } = data

  axiosClient = axios.create({ headers })
  const { webdav } = client({ axiosClient, baseURI: baseUrl })

  const successful: Resource[] = []
  const failed: { resource: Resource; status: number }[] = []
  const queue = new PQueue({ concurrency: concurrentRequests })

  const doDelete = (r: Resource) => {
    if (topic === 'fileListDelete') {
      return webdav.deleteFile(space, { path: r.path })
    }

    return webdav.clearTrashBin(space, { id: r.id })
  }

  const promises = resources.map((r) => {
    return queue.add(async () => {
      try {
        const { status } = await doDelete(r)

        if (status === 204) {
          successful.push(r)
          return
        }

        if (status === 423) {
          // retry
          const { status: retryStatus } = await doDelete(r)
          if (retryStatus === 204) {
            successful.push(r)
            return
          }
        }

        failed.push({ status, resource: r })
      } catch (error) {
        failed.push({ status: error.statusCode, resource: r })
      }
    })
  })

  await Promise.allSettled(promises)

  postMessage(JSON.stringify({ successful, failed }))
}

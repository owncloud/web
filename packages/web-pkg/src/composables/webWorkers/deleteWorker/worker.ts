import axios, { AxiosInstance } from 'axios'
import PQueue from 'p-queue'
import { Resource, client, SpaceResource } from '@ownclouders/web-client'
import { WorkerTopic } from '../../piniaStores/webWorkers'

type MessageData = {
  baseUrl?: string
  accessToken?: string
  headers?: Record<string, string>
  space?: SpaceResource
  resources?: Resource[]
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

  const { baseUrl, headers, space, resources } = data

  axiosClient = axios.create({ headers })
  const { webdav } = client({ axiosClient, baseURI: baseUrl })

  const successful: Resource[] = []
  const failed: { resource: Resource; status: number }[] = []
  const queue = new PQueue({ concurrency: 2 })

  const doDelete = (path: string) => webdav.deleteFile(space, { path })

  const promises = resources.map((r) => {
    return queue.add(async () => {
      const { status } = await doDelete(r.path)

      if (status === 204) {
        successful.push(r)
        return
      }

      if (status === 423) {
        // retry
        const { status: retryStatus } = await doDelete(r.path)
        if (retryStatus === 204) {
          successful.push(r)
          return
        }
      }

      failed.push({ status, resource: r })
    })
  })

  await Promise.allSettled(promises)

  postMessage(JSON.stringify({ successful, failed }))
}

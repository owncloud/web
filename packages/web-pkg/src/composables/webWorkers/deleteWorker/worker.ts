import PQueue from 'p-queue'
import { Resource, encodePath } from '@ownclouders/web-client'
import { WorkerTopics } from '../../piniaStores/webWorkers'

type MessageData = {
  baseUrl: string
  accessToken: string
  headers: Record<string, string>
  resources: Resource[]
}

type Message = {
  topic: WorkerTopics
  data: MessageData
}

let accessToken: string

self.onmessage = async (e: MessageEvent) => {
  const { topic, data } = JSON.parse(e.data) as Message

  if (accessToken === undefined || accessToken === null) {
    // init access token, empty string if in public context
    accessToken = data.accessToken || ''
  }

  if (topic === 'tokenUpdate') {
    // token must only be updated for bearer tokens, not on public links
    if (accessToken?.startsWith('Bearer')) {
      accessToken = data.accessToken
    }

    return
  }

  const { baseUrl, headers, resources } = data

  const successful: Resource[] = []
  const failed: { resource: Resource; status: number }[] = []
  const queue = new PQueue({ concurrency: 2 })

  const doDelete = async (path: string) => {
    // fake timer so requests take more time
    await new Promise((res) => setTimeout(res, 2000))
    return fetch(`${baseUrl}/${encodePath(path)}`, {
      method: 'DELETE',
      headers: { ...headers, ...(accessToken && { Authorization: accessToken }) }
    })
  }

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

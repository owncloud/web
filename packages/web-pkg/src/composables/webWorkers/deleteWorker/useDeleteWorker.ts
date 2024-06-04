import { unref } from 'vue'
import { useWebWorkersStore } from '../../piniaStores/webWorkers'
import type { Resource, SpaceResource } from '@ownclouders/web-client'
import { useConfigStore } from '../../piniaStores'
import { useLoadingService } from '../../loadingService'
import { useRequestHeaders } from '../../requestHeaders'
import DeleteWorker from './worker?worker'

type WorkerReturnData = {
  successful: Resource[]
  failed: { resource: Resource; status: number }[]
}

export type DelteWorkerTopics = 'fileListDelete' | 'trashBinDelete' | 'tokenUpdate'

export const useDeleteWorker = ({
  concurrentRequests = 4
}: { concurrentRequests?: number } = {}) => {
  const configStore = useConfigStore()
  const loadingService = useLoadingService()
  const { headers } = useRequestHeaders()
  const { createWorker, terminateWorker } = useWebWorkersStore()

  const startWorker = (
    {
      topic,
      space,
      resources
    }: { topic: DelteWorkerTopics; space: SpaceResource; resources: Resource[] },
    callback: (result: WorkerReturnData) => void
  ) => {
    const worker = createWorker<WorkerReturnData>(DeleteWorker as unknown as string, {
      needsTokenRenewal: true
    })

    let resolveLoading: (value: unknown) => void

    unref(worker.worker).onmessage = (e: MessageEvent) => {
      terminateWorker(worker.id)
      resolveLoading?.(true)
      callback(JSON.parse(e.data))
    }

    loadingService.addTask(
      () =>
        new Promise((res) => {
          resolveLoading = res
        })
    )

    worker.post(getWorkerData({ topic, space, resources }))
  }

  const getWorkerData = ({
    topic,
    space,
    resources
  }: {
    topic: DelteWorkerTopics
    space: SpaceResource
    resources: Resource[]
  }) => {
    return JSON.stringify({
      topic,
      data: {
        space,
        resources,
        concurrentRequests,
        baseUrl: configStore.serverUrl,
        headers: unref(headers)
      }
    })
  }

  return { startWorker }
}

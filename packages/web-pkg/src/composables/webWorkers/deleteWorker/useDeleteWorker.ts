import { unref } from 'vue'
import { useWebWorkersStore } from '../../piniaStores/webWorkers'
import { Resource, SpaceResource, urlJoin } from '@ownclouders/web-client'
import { useConfigStore } from '../../piniaStores'
import { useLoadingService } from '../../loadingService'
import { useRequestHeaders } from '../../requestHeaders'
import DeleteWorker from './worker?worker'

type WorkerReturnData = {
  successful: Resource[]
  failed: { resource: Resource; status: number }[]
}

export const useDeleteWorker = () => {
  const configStore = useConfigStore()
  const loadingService = useLoadingService()
  const { headers } = useRequestHeaders()
  const { createWorker, terminateWorker } = useWebWorkersStore()

  const startWorker = (
    { space, resources }: { space: SpaceResource; resources: Resource[] },
    callback: (result: WorkerReturnData) => void
  ) => {
    const worker = createWorker<WorkerReturnData>(DeleteWorker as unknown as string)

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

    worker.post(getWorkerData({ space, resources }))
  }

  const getWorkerData = ({ space, resources }: { space: SpaceResource; resources: Resource[] }) => {
    return JSON.stringify({
      topic: 'startProcess',
      data: {
        resources,
        baseUrl: urlJoin(configStore.serverUrl, 'remote.php', 'dav', space.webDavPath),
        accessToken: unref(headers).Authorization,
        headers: unref(headers)
      }
    })
  }

  return { startWorker }
}

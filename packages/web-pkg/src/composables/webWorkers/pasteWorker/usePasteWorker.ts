import { unref } from 'vue'
import { useWebWorkersStore } from '../../piniaStores/webWorkers'
import { useConfigStore } from '../../piniaStores'
import { useLoadingService } from '../../loadingService'
import { useRequestHeaders } from '../../requestHeaders'
import type { Resource } from '@ownclouders/web-client'
import type { TransferData } from '../../../helpers/resource/conflictHandling'
import PasteWorker from './worker?worker'

type WorkerReturnData = {
  successful: Resource[]
  failed: { resourceName: string; error: Error }[]
}

/**
 * Web worker for pasting copied/cut resources into another location.
 */
export const usePasteWorker = () => {
  const configStore = useConfigStore()
  const loadingService = useLoadingService()
  const { headers } = useRequestHeaders()
  const { createWorker, terminateWorker } = useWebWorkersStore()

  const startWorker = (
    transferData: TransferData[],
    callback: (result: WorkerReturnData) => void
  ) => {
    const worker = createWorker<WorkerReturnData>(PasteWorker as unknown as string, {
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

    worker.post(getWorkerData(transferData))
  }

  const getWorkerData = (transferData: TransferData[]) => {
    return JSON.stringify({
      topic: 'startProcess',
      data: {
        transferData,
        baseUrl: configStore.serverUrl,
        headers: unref(headers)
      }
    })
  }

  return { startWorker }
}

import { ref, unref } from 'vue'
import { AuthServiceInterface } from '../../authContext'
import { WebWorker, useWebWorkersStore } from '../../piniaStores/webWorkers'
import TokenWorker from './worker?worker'

export type TokenTimerWorkerTopic = 'set' | 'reset'

export const useTokenTimerWorker = ({ authService }: { authService: AuthServiceInterface }) => {
  const { createWorker } = useWebWorkersStore()

  const worker = ref<WebWorker>()

  const startWorker = () => {
    worker.value = createWorker(TokenWorker as unknown as string)

    unref(unref(worker).worker).onmessage = () => {
      authService.signinSilent().catch((e) => {
        console.error('token renewal failed:', e)
      })
    }
  }

  const setTokenTimer = ({
    expiry,
    expiryThreshold
  }: {
    expiry: number
    expiryThreshold: number
  }) => {
    if (!unref(worker)) {
      console.error('token timer worker is not running')
      return
    }

    unref(worker).post(JSON.stringify({ topic: 'set', expiry, expiryThreshold }))
  }

  const resetTokenTimer = () => {
    if (!unref(worker)) {
      console.error('token timer worker is not running')
      return
    }

    unref(worker).post(JSON.stringify({ topic: 'reset' }))
  }

  return { startWorker, setTokenTimer, resetTokenTimer }
}

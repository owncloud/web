import { unref } from 'vue'
import { useWebWorker } from '@vueuse/core'
import TokenWorker from '../../../../../src/composables/webWorkers/tokenTimerWorker/worker?worker'

describe('token timer worker', () => {
  let worker: ReturnType<typeof useWebWorker>

  beforeEach(() => {
    worker = useWebWorker(TokenWorker as unknown as string, { type: 'module' })
  })

  afterEach(() => {
    worker.terminate()
  })

  it('should not post a message with "reset" topic', async () => {
    const messageSpy = vi.fn()
    unref(worker.worker).onmessage = messageSpy
    worker.post(JSON.stringify({ topic: 'reset' }))

    await new Promise((resolve) => setTimeout(resolve, 1100))

    expect(messageSpy).not.toHaveBeenCalled()
  })

  it('should post a message with "set" topic', async () => {
    const messageSpy = vi.fn()
    unref(worker.worker).onmessage = messageSpy
    worker.post(JSON.stringify({ topic: 'set', expiry: 1, expiryThreshold: 1 }))

    await new Promise((resolve) => setTimeout(resolve, 1100))

    expect(messageSpy).toHaveBeenCalled()
  })
})

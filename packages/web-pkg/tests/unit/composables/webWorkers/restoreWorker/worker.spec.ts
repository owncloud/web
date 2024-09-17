import { unref } from 'vue'
import { useWebWorker } from '@vueuse/core'
import RestoreWorker from '../../../../../src/composables/webWorkers/restoreWorker/worker?worker'
import { mock } from 'vitest-mock-extended'
import type { WebDAV } from '@ownclouders/web-client/webdav'

const resourceMock = {
  id: 'resourceId',
  name: 'resourceName',
  path: '/folder/someFile.txt'
}

const spaceMock = {
  id: 'sourceSpaceId'
}

const dataMock = {
  resources: [resourceMock],
  space: spaceMock,
  missingFolderPaths: [],
  baseUrl: 'https://example.com'
}

describe('delete worker', () => {
  let worker: ReturnType<typeof useWebWorker>
  let webDavMock: ReturnType<typeof mock<WebDAV>>

  let resolveTest: (value: boolean) => unknown
  let workerPromise: Promise<unknown>

  beforeEach(() => {
    worker = useWebWorker(RestoreWorker as unknown as string, { type: 'module' })
    webDavMock = mock<WebDAV>()

    workerPromise = new Promise((resolve) => {
      resolveTest = resolve
    })

    vi.doMock('@ownclouders/web-client', async (importOriginal) => ({
      ...(await importOriginal<any>()),
      client: () => ({ webdav: webDavMock, ocs: undefined, graph: undefined })
    }))
  })

  afterEach(() => {
    worker.terminate()

    workerPromise = undefined
    resolveTest = undefined
    webDavMock = undefined
  })

  it('calls webdav restoreFile operation and returns successful files', async () => {
    webDavMock.restoreFile.mockResolvedValue({ status: 200, result: undefined, body: undefined })

    unref(worker.worker).onmessage = (e: MessageEvent) => {
      const { successful } = JSON.parse(e.data)
      expect(successful.length).toBe(1)
      expect(webDavMock.restoreFile).toHaveBeenCalledTimes(1)

      resolveTest(true)
    }

    worker.post(
      JSON.stringify({
        topic: 'startProcess',
        data: dataMock
      })
    )

    await workerPromise
  })

  it('creates missing folders', async () => {
    webDavMock.createFolder.mockResolvedValue(undefined)
    webDavMock.restoreFile.mockResolvedValue({ status: 200, result: undefined, body: undefined })

    unref(worker.worker).onmessage = () => {
      expect(webDavMock.createFolder).toHaveBeenCalledTimes(1)

      resolveTest(true)
    }

    worker.post(
      JSON.stringify({
        topic: 'startProcess',
        data: { ...dataMock, missingFolderPaths: '/folder' }
      })
    )

    await workerPromise
  })

  it('returns failed files', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    webDavMock.restoreFile.mockRejectedValue({ response: {} })

    unref(worker.worker).onmessage = (e: MessageEvent) => {
      const { failed } = JSON.parse(e.data)
      expect(failed.length).toBe(1)

      resolveTest(true)
    }

    worker.post(
      JSON.stringify({
        topic: 'startProcess',
        data: dataMock
      })
    )

    await workerPromise
  })
})

import { unref } from 'vue'
import { useWebWorker } from '@vueuse/core'
import ExportAsPdfWorker from '../../../../../src/composables/webWorkers/exportAsPdfWorker/worker?worker'
import { mock } from 'vitest-mock-extended'
import { type WebDAV } from '@ownclouders/web-client/webdav'

const destinationFolderMock = {
  id: 'destinationFolderId',
  name: 'Documents',
  path: '/Documents',
  fileId: 'destinationFolderId'
}

const spaceMock = {
  id: 'spaceId',
  name: 'Personal'
}

const dataMock = {
  baseUrl: 'https://example.com',
  destinationFolder: destinationFolderMock,
  space: spaceMock,
  fileName: 'test-document.pdf',
  content: '# Hello World'
}

const createdResourceMock = {
  id: 'created-resource-id',
  name: 'test-document.pdf',
  path: '/Documents/test-document.pdf',
  fileId: 'created-resource-id'
}

vi.mock('../../../../../src/composables/webWorkers/exportAsPdfWorker/renderer', () => ({
  PDFRenderer: vi.fn().mockImplementation(() => ({
    renderAsArrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(1024))
  }))
}))

describe('export as PDF worker', () => {
  let worker: ReturnType<typeof useWebWorker>
  let webDavMock: ReturnType<typeof mock<WebDAV>>

  let resolveTest: (value: boolean) => unknown
  let workerPromise: Promise<unknown>

  beforeEach(() => {
    worker = useWebWorker(ExportAsPdfWorker as unknown as string, { type: 'module' })
    webDavMock = mock<WebDAV>()

    workerPromise = new Promise((resolve) => {
      resolveTest = resolve
    })

    vi.doMock('@ownclouders/web-client', async (importOriginal) => ({
      ...(await importOriginal<any>()),
      webdav: () => webDavMock
    }))
  })

  afterEach(() => {
    worker.terminate()

    workerPromise = undefined
    resolveTest = undefined
    webDavMock = undefined
  })

  it('successfully creates and uploads PDF file', async () => {
    webDavMock.listFiles.mockResolvedValue({
      children: [],
      resource: destinationFolderMock
    })
    webDavMock.putFileContents.mockResolvedValue(createdResourceMock)

    unref(worker.worker).onmessage = (e: MessageEvent) => {
      const { successful, failed } = JSON.parse(e.data)
      expect(successful.length).toBe(1)
      expect(failed.length).toBe(0)
      expect(successful[0]).toEqual(createdResourceMock)
      expect(webDavMock.listFiles).toHaveBeenCalledTimes(1)
      expect(webDavMock.putFileContents).toHaveBeenCalledTimes(1)

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

  it('handles file name conflicts by resolving duplicates', async () => {
    const existingResources = [
      { name: 'test-document.pdf', id: 'existing-1', path: '/Documents/test-document.pdf' },
      { name: 'test-document (1).pdf', id: 'existing-2', path: '/Documents/test-document (1).pdf' }
    ]

    webDavMock.listFiles.mockResolvedValue({
      children: existingResources,
      resource: destinationFolderMock
    })
    webDavMock.putFileContents.mockResolvedValue({
      ...createdResourceMock,
      name: 'test-document (2).pdf'
    })

    unref(worker.worker).onmessage = (e: MessageEvent) => {
      const { successful } = JSON.parse(e.data)
      expect(successful.length).toBe(1)
      expect(webDavMock.putFileContents).toHaveBeenCalledWith(
        spaceMock,
        expect.objectContaining({
          fileName: 'test-document (2).pdf'
        })
      )

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

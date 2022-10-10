import { privatePreviewBlob } from 'web-pkg/src/helpers/preview'

import mockAxios from 'jest-mock-axios'
import merge from 'lodash-es/merge'

beforeEach(mockAxios.reset)

const defaultOptions = {
  server: 'https://www.ocis.rules/',
  userId: 'ocis',
  token: 'rules',
  resource: {
    id: 'id',
    path: 'path',
    webDavPath: '/path'
  }
}

describe('privatePreviewBlob', () => {
  it('returns a preview objectURL', async () => {
    window.URL.createObjectURL = jest.fn()
    const privatePreviewBlobPromise = privatePreviewBlob(defaultOptions)
    mockAxios.mockResponse({ data: 'data' })
    await privatePreviewBlobPromise
    await expect(mockAxios.get).toHaveBeenCalledTimes(1)
    await expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1)
    await expect(window.URL.createObjectURL).toHaveBeenCalledWith('data')
  })

  test('cache', async () => {
    window.URL.createObjectURL = jest.fn().mockImplementation(() => 'data')
    let privatePreviewBlobPromise = privatePreviewBlob(
      merge({ resource: { etag: 'same' } }, defaultOptions),
      true
    )
    mockAxios.mockResponse({ data: 'data' })
    await privatePreviewBlobPromise
    await expect(mockAxios.get).toHaveBeenCalledTimes(1)
    await expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1)
    await expect(window.URL.createObjectURL).toHaveBeenCalledWith('data')

    privatePreviewBlobPromise = privatePreviewBlob(
      merge({ resource: { etag: 'same' } }, defaultOptions),
      true
    )
    await privatePreviewBlobPromise
    await expect(mockAxios.get).toHaveBeenCalledTimes(1)
    await expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1)
    await expect(window.URL.createObjectURL).toHaveBeenCalledWith('data')

    privatePreviewBlobPromise = privatePreviewBlob(
      merge({ resource: { etag: 'other' } }, defaultOptions),
      true
    )
    mockAxios.mockResponse({ data: 'data' })
    await privatePreviewBlobPromise
    await expect(mockAxios.get).toHaveBeenCalledTimes(2)
    await expect(window.URL.createObjectURL).toHaveBeenCalledTimes(2)
    await expect(window.URL.createObjectURL).toHaveBeenCalledWith('data')

    privatePreviewBlobPromise = privatePreviewBlob(
      merge({ resource: { etag: 'other' }, dimensions: [10, 10] }, defaultOptions) as any,
      true
    )
    mockAxios.mockResponse({ data: 'data' })
    await privatePreviewBlobPromise
    await expect(mockAxios.get).toHaveBeenCalledTimes(3)
    await expect(window.URL.createObjectURL).toHaveBeenCalledTimes(3)
    await expect(window.URL.createObjectURL).toHaveBeenCalledWith('data')
  })
})

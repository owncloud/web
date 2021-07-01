import { privatePreviewBlob } from '../../../../src/helpers/resource'
import mockAxios from 'jest-mock-axios'
import merge from 'lodash-es/merge'

beforeEach(mockAxios.reset)

const defaultOptions = {
  server: 'https://www.ocis.rules/',
  userId: 'ocis',
  token: 'rules',
  resource: {
    id: 'id',
    path: 'path'
  }
}

describe('privatePreviewBlob', () => {
  it('returns a preview objectURL', async () => {
    window.URL.createObjectURL = jest.fn()
    const privatePreviewBlobPromise = privatePreviewBlob(defaultOptions)
    mockAxios.mockResponseFor(
      { url: 'https://www.ocis.rules/remote.php/dav/files/ocispath?a=1&preview=1&scalingup=0' },
      { data: 'data' }
    )
    await privatePreviewBlobPromise
    await expect(mockAxios.get).toBeCalledTimes(1)
    await expect(window.URL.createObjectURL).toBeCalledTimes(1)
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
    await expect(mockAxios.get).toBeCalledTimes(1)
    await expect(window.URL.createObjectURL).toBeCalledTimes(1)
    await expect(window.URL.createObjectURL).toHaveBeenCalledWith('data')

    privatePreviewBlobPromise = privatePreviewBlob(
      merge({ resource: { etag: 'same' } }, defaultOptions),
      true
    )
    await privatePreviewBlobPromise
    await expect(mockAxios.get).toBeCalledTimes(1)
    await expect(window.URL.createObjectURL).toBeCalledTimes(1)
    await expect(window.URL.createObjectURL).toHaveBeenCalledWith('data')

    privatePreviewBlobPromise = privatePreviewBlob(
      merge({ resource: { etag: 'other' } }, defaultOptions),
      true
    )
    mockAxios.mockResponse({ data: 'data' })
    await privatePreviewBlobPromise
    await expect(mockAxios.get).toBeCalledTimes(2)
    await expect(window.URL.createObjectURL).toBeCalledTimes(2)
    await expect(window.URL.createObjectURL).toHaveBeenCalledWith('data')

    privatePreviewBlobPromise = privatePreviewBlob(
      merge({ resource: { etag: 'other' }, dimensions: [10, 10] }, defaultOptions) as any,
      true
    )
    mockAxios.mockResponse({ data: 'data' })
    await privatePreviewBlobPromise
    await expect(mockAxios.get).toBeCalledTimes(3)
    await expect(window.URL.createObjectURL).toBeCalledTimes(3)
    await expect(window.URL.createObjectURL).toHaveBeenCalledWith('data')
  })
})

import { privatePreviewBlob } from 'web-pkg/src/helpers/preview'
import { mockDeep } from 'jest-mock-extended'
import merge from 'lodash-es/merge'
import { ClientService } from 'web-pkg'

const getDefaultOptions = () => ({
  clientService: mockDeep<ClientService>(),
  server: 'https://www.ocis.rules/',
  userId: 'ocis',
  resource: {
    id: 'id',
    path: 'path',
    webDavPath: '/path'
  }
})

describe('privatePreviewBlob', () => {
  it('returns a preview objectURL', async () => {
    const defaultOptions = getDefaultOptions()
    defaultOptions.clientService.httpAuthenticated.get.mockResolvedValue({ data: 'data' })
    window.URL.createObjectURL = jest.fn()
    const privatePreviewBlobPromise = privatePreviewBlob(defaultOptions)
    await privatePreviewBlobPromise
    await expect(defaultOptions.clientService.httpAuthenticated.get).toHaveBeenCalledTimes(1)
    await expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1)
    await expect(window.URL.createObjectURL).toHaveBeenCalledWith('data')
  })

  test('cache', async () => {
    const defaultOptions = getDefaultOptions()
    defaultOptions.clientService.httpAuthenticated.get.mockResolvedValue({ data: 'data' })
    window.URL.createObjectURL = jest.fn().mockImplementation(() => 'data')
    let privatePreviewBlobPromise = privatePreviewBlob(
      merge({ resource: { etag: 'same' } }, defaultOptions),
      true
    )
    await privatePreviewBlobPromise
    await expect(defaultOptions.clientService.httpAuthenticated.get).toHaveBeenCalledTimes(1)
    await expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1)
    await expect(window.URL.createObjectURL).toHaveBeenCalledWith('data')

    privatePreviewBlobPromise = privatePreviewBlob(
      merge({ resource: { etag: 'same' } }, defaultOptions),
      true
    )
    await privatePreviewBlobPromise
    await expect(defaultOptions.clientService.httpAuthenticated.get).toHaveBeenCalledTimes(1)
    await expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1)
    await expect(window.URL.createObjectURL).toHaveBeenCalledWith('data')

    privatePreviewBlobPromise = privatePreviewBlob(
      merge({ resource: { etag: 'other' } }, defaultOptions),
      true
    )
    await privatePreviewBlobPromise
    await expect(defaultOptions.clientService.httpAuthenticated.get).toHaveBeenCalledTimes(2)
    await expect(window.URL.createObjectURL).toHaveBeenCalledTimes(2)
    await expect(window.URL.createObjectURL).toHaveBeenCalledWith('data')

    privatePreviewBlobPromise = privatePreviewBlob(
      merge({ resource: { etag: 'other' }, dimensions: [10, 10] }, defaultOptions) as any,
      true
    )
    await privatePreviewBlobPromise
    await expect(defaultOptions.clientService.httpAuthenticated.get).toHaveBeenCalledTimes(3)
    await expect(window.URL.createObjectURL).toHaveBeenCalledTimes(3)
    await expect(window.URL.createObjectURL).toHaveBeenCalledWith('data')
  })
})

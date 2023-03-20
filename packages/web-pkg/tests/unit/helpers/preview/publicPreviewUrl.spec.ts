import { publicPreviewUrl } from 'web-pkg/src/helpers/preview'
import { URLSearchParams } from 'url'
import { mockDeep } from 'jest-mock-extended'
import { ClientService } from 'web-pkg'

const getDefaultOptions = () => ({
  clientService: mockDeep<ClientService>(),
  resource: {
    etag: 'etag',
    downloadURL: 'downloadURL'
  }
})

describe('publicPreviewUrl', () => {
  test('publicPreviewUrl', async () => {
    const defaultOptions = getDefaultOptions()
    defaultOptions.clientService.httpUnAuthenticated.head.mockResolvedValueOnce({ status: 200 })
    window.URL.createObjectURL = jest.fn()
    let publicPreviewUrlPromise = publicPreviewUrl(defaultOptions)

    let url = await publicPreviewUrlPromise
    const params = new URLSearchParams(url.split('?')[1])
    expect(params.get('a')).toBe('1')
    expect(params.get('c')).toBe('etag')
    expect(params.get('preview')).toBe('1')
    expect(params.get('scalingup')).toBe('0')
    expect(defaultOptions.clientService.httpUnAuthenticated.head).toHaveBeenCalledTimes(1)

    defaultOptions.clientService.httpUnAuthenticated.head.mockResolvedValueOnce({ status: 404 })
    publicPreviewUrlPromise = publicPreviewUrl(defaultOptions)

    url = await publicPreviewUrlPromise
    expect(url).toBeFalsy()
    expect(defaultOptions.clientService.httpUnAuthenticated.head).toHaveBeenCalledTimes(2)
  })
})

import { publicPreviewUrl } from 'web-pkg/src/helpers/preview'
import mockAxios from 'jest-mock-axios'
import { URLSearchParams } from 'url'

beforeEach(mockAxios.reset)

const defaultOptions = {
  resource: {
    etag: 'etag',
    downloadURL: 'downloadURL'
  }
}

describe('publicPreviewUrl', () => {
  test('publicPreviewUrl', async () => {
    window.URL.createObjectURL = jest.fn()
    let publicPreviewUrlPromise = publicPreviewUrl(defaultOptions)
    mockAxios.mockResponse({ data: undefined })

    let url = await publicPreviewUrlPromise
    const params = new URLSearchParams(url.split('?')[1])
    expect(params.get('a')).toBe('1')
    expect(params.get('c')).toBe('etag')
    expect(params.get('preview')).toBe('1')
    expect(params.get('scalingup')).toBe('0')
    expect(mockAxios.head).toHaveBeenCalledTimes(1)

    publicPreviewUrlPromise = publicPreviewUrl(defaultOptions)
    mockAxios.mockResponse({ data: undefined, status: 404 })

    url = await publicPreviewUrlPromise
    expect(url).toBeFalsy()
    expect(mockAxios.head).toHaveBeenCalledTimes(2)
  })
})

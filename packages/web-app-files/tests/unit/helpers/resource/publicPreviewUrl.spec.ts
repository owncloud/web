import { publicPreviewUrl } from '../../../../src/helpers/resource'
import mockAxios from 'jest-mock-axios'

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
    await expect(url).toBe('downloadURL?a=1&c=etag&preview=1&scalingup=0')
    await expect(mockAxios.head).toBeCalledTimes(1)

    publicPreviewUrlPromise = publicPreviewUrl(defaultOptions)
    mockAxios.mockResponse({ data: undefined, status: 404 })

    url = await publicPreviewUrlPromise
    await expect(url).toBeFalsy()
    await expect(mockAxios.head).toBeCalledTimes(2)
  })
})

import { avatarUrl } from '../../../src/helpers/user'
import { ImageDimension } from '../../../src/constants'
import mockAxios from 'jest-mock-axios'

beforeEach(() => {
  mockAxios.reset()
  mockClient(undefined)
})

const mockClient = (signUrl: any) => {
  const vue = jest.fn()
  vue.prototype.$client = jest.fn()
  vue.prototype.$client.signUrl = signUrl
  ;(global as any).Vue = vue
}

const defaultOptions = {
  server: 'https://www.ocis.rules/',
  username: 'ocis',
  token: 'rules'
}

const buildUrl = ({
  server,
  username,
  size
}: {
  server: string
  username: string
  size?: number
}) =>
  [server, 'remote.php/dav/avatars/', username, `/${size || ImageDimension.Avatar}.png`].join('')

describe('avatarUrl', () => {
  it('throws an error', async () => {
    const avatarUrlPromise = avatarUrl(defaultOptions)
    mockAxios.mockResponse({ status: 404, data: undefined, statusText: 'error' })
    await expect(avatarUrlPromise).rejects.toThrowError(new Error('error'))
    expect(mockAxios.head).toHaveBeenCalledWith(buildUrl(defaultOptions), undefined)
  })

  it('returns a unsigned url', async () => {
    const avatarUrlPromise = avatarUrl(defaultOptions)
    mockAxios.mockResponse({ status: 200, data: undefined })
    await expect(avatarUrlPromise).resolves.toBe(buildUrl(defaultOptions))
    expect(mockAxios.head).toHaveBeenCalledWith(buildUrl(defaultOptions), undefined)
  })

  it('returns a signed url', async () => {
    const signUrlMock = jest.fn().mockImplementation(url => {
      return `${url}?signed=true`
    })
    mockClient(signUrlMock)
    const avatarUrlPromise = avatarUrl(defaultOptions)
    mockAxios.mockResponse({ status: 200, data: undefined })
    await expect(avatarUrlPromise).resolves.toBe(`${buildUrl(defaultOptions)}?signed=true`)
    expect(mockAxios.head).toHaveBeenCalledWith(buildUrl(defaultOptions), undefined)
  })

  it('handles caching', async () => {
    const avatarUrlPromiseUncached = avatarUrl(defaultOptions, true)
    await mockAxios.mockResponse({ status: 200, data: undefined })
    await expect(avatarUrlPromiseUncached).resolves.toBe(buildUrl(defaultOptions))
    expect(mockAxios.head).toBeCalledTimes(1)

    const avatarUrlPromiseCached = avatarUrl(defaultOptions, true)
    await expect(avatarUrlPromiseCached).resolves.toBe(buildUrl(defaultOptions))
    expect(mockAxios.head).toBeCalledTimes(1)

    const avatarUrlPromiseOtherSize = avatarUrl({ ...defaultOptions, size: 1 }, true)
    await mockAxios.mockResponse({ status: 200, data: undefined })
    await expect(avatarUrlPromiseOtherSize).resolves.toBe(buildUrl({ ...defaultOptions, size: 1 }))
    expect(mockAxios.head).toBeCalledTimes(2)

    const avatarUrlPromiseSameUncached = avatarUrl(defaultOptions, false)
    await mockAxios.mockResponse({ status: 200, data: undefined })
    await expect(avatarUrlPromiseSameUncached).resolves.toBe(buildUrl(defaultOptions))
    expect(mockAxios.head).toBeCalledTimes(3)
  })
})

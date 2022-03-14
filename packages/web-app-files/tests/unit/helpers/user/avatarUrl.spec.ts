import { avatarUrl } from '../../../../src/helpers/user'
import { ImageDimension } from '../../../../src/constants'
import mockAxios from 'jest-mock-axios'
import { ClientService } from 'web-pkg/src/services'

beforeEach(() => {
  mockAxios.reset()
})

const clientService = new ClientService()
clientService.owncloudSdk = {}

const defaultOptions = {
  clientService,
  server: 'https://www.ocis.rules/',
  username: 'ocis',
  token: 'rules'
}

describe('avatarUrl', () => {
  it('throws an error', async () => {
    const avatarUrlPromise = avatarUrl(defaultOptions)
    mockAxios.mockResponse({ status: 404, data: undefined, statusText: 'error' })
    await expect(avatarUrlPromise).rejects.toThrowError(new Error('error'))
    expect(mockAxios.head).toHaveBeenCalledWith(buildUrl(defaultOptions), expect.anything())
  })

  it('returns an unsigned url', async () => {
    const avatarUrlPromise = avatarUrl(defaultOptions)
    mockAxios.mockResponse({ data: undefined })
    await expect(avatarUrlPromise).resolves.toBe(buildUrl(defaultOptions))
    expect(mockAxios.head).toHaveBeenCalledWith(buildUrl(defaultOptions), expect.anything())
  })

  it('returns a signed url', async () => {
    clientService.owncloudSdk.signUrl = jest.fn().mockImplementation((url) => {
      return `${url}?signed=true`
    })
    const avatarUrlPromise = avatarUrl(defaultOptions)
    mockAxios.mockResponse({ data: undefined })
    await expect(avatarUrlPromise).resolves.toBe(`${buildUrl(defaultOptions)}?signed=true`)
    expect(mockAxios.head).toHaveBeenCalledWith(buildUrl(defaultOptions), expect.anything())
  })

  it('handles caching', async () => {
    clientService.owncloudSdk.signUrl = jest.fn().mockImplementation((url) => url)

    const avatarUrlPromiseUncached = avatarUrl(defaultOptions, true)
    await mockAxios.mockResponse({ data: undefined })
    await expect(avatarUrlPromiseUncached).resolves.toBe(buildUrl(defaultOptions))
    expect(mockAxios.head).toBeCalledTimes(1)

    const avatarUrlPromiseCached = avatarUrl(defaultOptions, true)
    await expect(avatarUrlPromiseCached).resolves.toBe(buildUrl(defaultOptions))
    expect(mockAxios.head).toBeCalledTimes(1)

    const avatarUrlPromiseOtherSize = avatarUrl({ ...defaultOptions, size: 1 }, true)
    await mockAxios.mockResponse({ data: undefined })
    await expect(avatarUrlPromiseOtherSize).resolves.toBe(buildUrl({ ...defaultOptions, size: 1 }))
    expect(mockAxios.head).toBeCalledTimes(2)

    const avatarUrlPromiseSameUncached = avatarUrl(defaultOptions, false)
    await mockAxios.mockResponse({ data: undefined })
    await expect(avatarUrlPromiseSameUncached).resolves.toBe(buildUrl(defaultOptions))
    expect(mockAxios.head).toBeCalledTimes(3)
  })
})

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

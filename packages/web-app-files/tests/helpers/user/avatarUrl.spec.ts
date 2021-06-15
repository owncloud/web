import { avatarUrl } from '../../../src/helpers/user'
import mockAxios from 'jest-mock-axios'

beforeEach(() => {
  mockAxios.reset()
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
  token: 'rules',
  size: 64
}

const buildUrl = ({ server, username, size }: { server: string; username: string; size: number }) =>
  [server, 'remote.php/dav/avatars/', username, `/${size}.png`].join('')

describe('avatarUrl', () => {
  it('throws an error', async () => {
    const avatarUrlPromise = avatarUrl(defaultOptions)
    mockAxios.mockResponse({ status: 404, statusText: 'no', data: undefined })
    await expect(avatarUrlPromise).rejects.toBeTruthy()
    expect(mockAxios.head).toHaveBeenCalledWith(buildUrl(defaultOptions), undefined)
  })

  it('returns a unsigned url', async () => {
    mockClient(undefined)
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
})

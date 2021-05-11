import { getAvatarSrc } from '../../src/helpers/user'

describe('getAvatarSrc', () => {
  it('throws an error', async () => {
    fetch.mockResponse(new Error(), { status: 404 })
    await expect(getAvatarSrc('userId', 'server', 'token')).rejects.toBeTruthy()
  })

  it('returns a signed url', async () => {
    fetch.mockResponse('', { status: 200 })
    const client = { signUrl: jest.fn() }
    await getAvatarSrc('userId', 'server', 'token', client)
    expect(client.signUrl.mock.calls.length).toBe(1)
  })

  it('returns the url if no valid client is present', async () => {
    fetch.mockResponse('', { status: 200 })
    const url = await getAvatarSrc('userId', 'server', 'token')
    expect(url).toBe('serverremote.php/dav/avatars/userId/128.png')
  })

  it('fetches avatarSrc from cache if url exists there', async () => {
    fetch.mockResponse('', { status: 200 })
    const client = { signUrl: jest.fn() }
    await getAvatarSrc('userId', 'server', 'token', client)
    expect(client.signUrl.mock.calls.length).toBe(0)
  })
})

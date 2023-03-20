import { loadPreview } from 'web-pkg/src/helpers/preview'
import { mockDeep } from 'jest-mock-extended'
import { ClientService } from 'web-pkg'

const clientService = mockDeep<ClientService>()

jest.mock('web-pkg/src/helpers/preview/publicPreviewUrl', () => ({
  publicPreviewUrl: jest.fn().mockReturnValue('publicPreviewUrl')
}))

jest.mock('web-pkg/src/helpers/preview/privatePreviewBlob', () => ({
  privatePreviewBlob: jest.fn().mockReturnValue('privatePreviewBlob')
}))

describe('loadPreview', () => {
  it('returns empty string if resource is a folder', async () => {
    const preview = await loadPreview({
      clientService,
      resource: { type: 'folder' },
      isPublic: true,
      dimensions: [0, 0]
    })

    expect(preview).toBe('')
  })

  it('returns empty string if resource has no extension', async () => {
    const preview = await loadPreview({
      clientService,
      resource: {},
      isPublic: true,
      dimensions: [0, 0]
    })

    expect(preview).toBe('')
  })

  it('returns empty string if is private but no server or userId or token is given', async () => {
    await expect(
      loadPreview({
        clientService,
        resource: { extension: 'jpg' },
        isPublic: false,
        dimensions: [0, 0]
      })
    ).resolves.toBe('')

    await expect(
      loadPreview({
        clientService,
        resource: { extension: 'jpg' },
        isPublic: false,
        dimensions: [0, 0],
        server: 'server'
      })
    ).resolves.toBe('')

    await expect(
      loadPreview({
        clientService,
        resource: { extension: 'jpg' },
        isPublic: false,
        dimensions: [0, 0],
        server: 'server',
        userId: 'userId'
      })
    ).resolves.toBe('')
  })

  it('returns a publicPreviewUrl', async () => {
    await expect(
      loadPreview({
        clientService,
        resource: { extension: 'jpg' },
        isPublic: true,
        dimensions: [0, 0]
      })
    ).resolves.toBe('publicPreviewUrl')
  })

  it('returns a privatePreviewBlob', async () => {
    await expect(
      loadPreview({
        clientService,
        resource: { extension: 'jpg' },
        isPublic: false,
        dimensions: [0, 0],
        server: 'server',
        userId: 'userId',
        token: 'token'
      })
    ).resolves.toBe('privatePreviewBlob')
  })
})

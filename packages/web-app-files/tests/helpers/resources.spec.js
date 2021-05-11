import { buildSharedResource } from '../../src/helpers/resources'

describe('buildSharedResource', () => {
  const resourceFactory = (incomingShares = false) => {
    let doResolve
    let pending = true
    let fulfilled = false

    const resourceUpdater = new Promise(resolve => (doResolve = resolve))
    resourceUpdater.pending = () => pending
    resourceUpdater.fulfilled = () => fulfilled

    const resource = buildSharedResource(
      {
        file_target: '/path.pdf',
        path: '/path.pdf',
        displayname_owner: 'displayname_owner',
        sharedWith: [
          {
            username: 'sharedWith',
            avatar: undefined
          }
        ]
      },
      incomingShares,
      '',
      '',
      '',
      '',
      r => {
        fulfilled = true
        pending = false
        doResolve(r)
      }
    )

    return { resource, resourceUpdater }
  }

  it('fetches avatars for outgoing shares in the background', async () => {
    const { resource, resourceUpdater } = resourceFactory()
    expect(resource.sharedWith[0].avatar).toBeFalsy()
    expect(resourceUpdater.pending()).toBeTruthy()
    expect(resourceUpdater.fulfilled()).toBeFalsy()

    const updatedResource = await resourceUpdater
    expect(updatedResource.sharedWith[0].avatar).toBeTruthy()
    expect(resourceUpdater.pending()).toBeFalsy()
    expect(resourceUpdater.fulfilled()).toBeTruthy()
  })

  it('fetches avatars for incoming shares in the background', async () => {
    const { resource, resourceUpdater } = resourceFactory(true)
    expect(resource.owner[0].avatar).toBeFalsy()
    expect(resourceUpdater.pending()).toBeTruthy()
    expect(resourceUpdater.fulfilled()).toBeFalsy()

    const updatedResource = await resourceUpdater
    expect(updatedResource.owner[0].avatar).toBeTruthy()
    expect(resourceUpdater.pending()).toBeFalsy()
    expect(resourceUpdater.fulfilled()).toBeTruthy()
  })
})

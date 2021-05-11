import { buildSharedResource } from '../../src/helpers/resources'

describe('buildSharedResource', () => {
  it('fetches avatars in the background', async () => {
    const resourceGen = (incomingShares = false) => {
      let doResolve
      let pending = true
      let fulfilled = false

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

      const resourceUpdater = new Promise(resolve => (doResolve = resolve))
      resourceUpdater.pending = () => pending
      resourceUpdater.fulfilled = () => fulfilled

      return { resource, resourceUpdater }
    }

    const { resource, resourceUpdater } = resourceGen()
    expect(resource.sharedWith[0].avatar).toBeFalsy()
    expect(resourceUpdater.pending()).toBeTruthy()
    expect(resourceUpdater.fulfilled()).toBeFalsy()

    const updatedResource = await resourceUpdater
    expect(updatedResource.sharedWith[0].avatar).toBeTruthy()
    expect(resourceUpdater.pending()).toBeFalsy()
    expect(resourceUpdater.fulfilled()).toBeTruthy()

    const { resource: isResource, resourceUpdater: isResourceUpdater } = resourceGen(true)
    expect(isResource.owner[0].avatar).toBeFalsy()
    expect(isResourceUpdater.pending()).toBeTruthy()
    expect(isResourceUpdater.fulfilled()).toBeFalsy()

    const updatedIsResource = await isResourceUpdater
    expect(updatedIsResource.owner[0].avatar).toBeTruthy()
    expect(isResourceUpdater.pending()).toBeFalsy()
    expect(isResourceUpdater.fulfilled()).toBeTruthy()
  })
})

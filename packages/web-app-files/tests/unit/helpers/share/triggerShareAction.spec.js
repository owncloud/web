import { triggerShareAction } from '../../../../src/helpers/share/triggerShareAction'

import OwnCloud from 'owncloud-sdk'
import { ShareStatus } from '@files/src/helpers/share'

jest.unmock('axios')
const $client = new OwnCloud()

jest.mock('../../../../src/helpers/resources', () => ({
  buildSharedResource: jest.fn((share) => share)
}))

describe('method triggerShareAction', () => {
  beforeEach(() => {
    fetch.resetMocks()
  })

  it('throws error if invalid share status given', async () => {
    const statusText = 'invalid new share status'
    await expect(triggerShareAction(null, ShareStatus.pending, true, null)).rejects.toThrow(
      statusText
    )
  })

  it('throws error if share action response status is not 200', async () => {
    const statusText = 'status is not 200'
    fetch.mockResponse(new Error(), { status: 404, statusText })
    await expect(
      triggerShareAction({ share: { id: 1 } }, ShareStatus.accepted, true, $client)
    ).rejects.toThrow(statusText)
  })

  it('silently fails when the response has a content-length header value of 0', async () => {
    fetch.mockResponse('', {
      headers: { 'content-length': 0 }
    })
    await expect(
      triggerShareAction({ share: { id: 1 } }, ShareStatus.accepted, true, $client)
    ).resolves.toBeNull()
  })

  it('returns a resource of type share if content-length header is present and valid', async () => {
    fetch.mockResponse(JSON.stringify({ ocs: { data: [{ id: 1 }] } }), {
      headers: { 'content-length': 1 }
    })
    await expect(
      triggerShareAction({ share: { id: 1 } }, ShareStatus.accepted, true, $client)
    ).resolves.toMatchObject({ id: 1 })
  })
})

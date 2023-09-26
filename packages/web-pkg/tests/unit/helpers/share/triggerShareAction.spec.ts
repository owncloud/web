import { triggerShareAction } from 'web-pkg/src/helpers/share/triggerShareAction'

import { ShareStatus } from 'web-client/src/helpers/share'
import { OwnCloudSdk } from 'web-client/src/types'
import { mockDeep } from 'jest-mock-extended'

jest.unmock('axios')
const $client = mockDeep<OwnCloudSdk>()

jest.mock('web-client/src/helpers/share', () => ({
  aggregateResourceShares: ([shares]) => [shares]
}))

describe('method triggerShareAction', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('throws error if invalid share status given', async () => {
    const statusText = 'invalid new share status'
    await expect(triggerShareAction(null, ShareStatus.pending, true, false, null)).rejects.toThrow(
      statusText
    )
  })

  it('throws error if share action response status is not 200', async () => {
    const statusText = 'status is not 200'
    $client.requests.ocs.mockImplementation(() =>
      Promise.resolve(
        mockDeep<Response>({
          status: 404,
          statusText
        })
      )
    )
    await expect(
      triggerShareAction({ share: { id: 1 } }, ShareStatus.accepted, true, false, $client)
    ).rejects.toThrow(statusText)
  })

  it('silently fails when the response has a content-length header value of 0', async () => {
    $client.requests.ocs.mockImplementation(() =>
      Promise.resolve(
        mockDeep<Response>({
          status: 200,
          headers: (() => {
            const headers = new Headers()
            headers.append('content-length', '0')
            return headers
          })()
        })
      )
    )
    await expect(
      triggerShareAction({ share: { id: 1 } }, ShareStatus.accepted, true, false, $client)
    ).resolves.toBeNull()
  })

  it('returns a resource of type share if content-length header is present and valid', async () => {
    $client.requests.ocs.mockImplementation(() => {
      const responseMock = mockDeep<Response>({
        status: 200,
        headers: (() => {
          const headers = new Headers()
          headers.append('content-length', '1')
          return headers
        })()
      })
      responseMock.json.mockImplementation(() => Promise.resolve({ ocs: { data: [{ id: 1 }] } }))
      return Promise.resolve(responseMock)
    })

    await expect(
      triggerShareAction({ share: { id: 1 } }, ShareStatus.accepted, true, false, $client)
    ).resolves.toMatchObject({ id: 1 })
  })
})

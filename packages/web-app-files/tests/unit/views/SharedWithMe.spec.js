import { wrapper, store, showMessage, getShare } from './SharedWithMe.setup'

describe('SharedWithMe component', () => {
  describe('method triggerShareAction', () => {
    beforeEach(() => {
      fetch.resetMocks()
      store.reset()
      showMessage.mockClear()
      getShare.mockClear()
    })

    it('errors if status is not 200', async () => {
      const statusText = 'status is not 200'
      fetch.mockResponse(new Error(), { status: 404, statusText })
      await wrapper
        .findAll('.file-row-share-status-action')
        .at(1)
        .trigger('click')

      expect(showMessage.mock.results[0].value.desc).toBe(statusText)
    })

    it('returns a share if content-length header is present and valid (oc10)', async () => {
      fetch.mockResponse(JSON.stringify({ ocs: { data: [{ id: 1 }] } }), {
        headers: { 'content-length': 1 }
      })
      await wrapper
        .findAll('.file-row-share-status-action')
        .at(1)
        .trigger('click')
      await wrapper.vm.$nextTick()

      expect(store.state.Files.resource).toMatchObject({ id: 1 })
      expect(getShare).toBeCalledTimes(0)
    })

    it('errors if content-length header is not valid (oc10)', async () => {
      fetch.mockResponse(JSON.stringify({ ocs: { data: [{ id: 1 }] } }), {
        headers: { 'content-length': 0 }
      })

      await wrapper
        .findAll('.file-row-share-status-action')
        .at(1)
        .trigger('click')
      await wrapper.vm.$nextTick()

      expect(showMessage.mock.results[0]).toBeFalsy()
    })

    it('returns a share if content-length header is not present (ocis)', async () => {
      const shareInfo = { id: 1, shareinfo: true }
      fetch.mockResponse(JSON.stringify({ ocs: { data: [{ id: 1 }] } }), {})
      getShare.mockReturnValueOnce({ shareInfo })

      await wrapper
        .findAll('.file-row-share-status-action')
        .at(1)
        .trigger('click')
      await wrapper.vm.$nextTick()

      expect(store.state.Files.resource).toMatchObject(shareInfo)
      expect(getShare).toBeCalledTimes(1)
    })
  })
})

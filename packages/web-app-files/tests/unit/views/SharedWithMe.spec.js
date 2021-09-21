import { mount } from '@vue/test-utils'
import { localVue, getStore } from './views.setup'
import SharedWithMe from '@files/src/views/SharedWithMe.vue'
import { shareStatus } from '@files/src/helpers/shareStatus'
import { shareTypes } from '../../../src/helpers/shareTypes'

const stubs = {
  'router-link': true,
  translate: true,
  'oc-pagination': true,
  'oc-spinner': true,
  'context-actions': true
}

const selectors = {
  pendingTable: '#files-shared-with-me-pending-table',
  pendingTableRow: '#files-shared-with-me-pending-table tbody > tr.oc-tbody-tr',
  pendingExpand: '#files-shared-with-me-pending-show-all[data-test-expand="true"]',
  pendingCollapse: '#files-shared-with-me-pending-show-all[data-test-expand="false"]',
  sharesNoContentMessage: '#files-shared-with-me-shares-empty',
  sharesTable: '#files-shared-with-me-shares-table',
  sharesTableRow: '#files-shared-with-me-shares-table tbody > tr.oc-tbody-tr',
  sharesToggleViewMode: '#files-shared-with-me-toggle-view-mode'
}

const spinnerStub = 'oc-spinner-stub'

describe('SharedWithMe page', () => {
  describe('when the view is still loading', () => {
    it('should show the loading indicator', () => {
      const wrapper = getMountedWrapper({ loading: true })
      expect(wrapper.find(spinnerStub).exists()).toBeTruthy()
    })
    it('should not show other components', () => {
      const wrapper = getMountedWrapper({ loading: true })
      expect(wrapper.find(selectors.pendingTable).exists()).toBeFalsy()
      expect(wrapper.find(selectors.sharesTable).exists()).toBeFalsy()
      expect(wrapper.find(selectors.sharesNoContentMessage).exists()).toBeFalsy()
    })
  })

  describe('when the page has loaded successfully', () => {
    it('should not show the loading indicator anymore', () => {
      const wrapper = getMountedWrapper({ loading: false })
      expect(wrapper.find(spinnerStub).exists()).toBeFalsy()
    })

    describe('pending shares', () => {
      describe('when there are no pending shares to be displayed', () => {
        it('should not show the pending shares list', () => {
          const wrapper = getMountedWrapper({
            store: getStore({
              activeFiles: [createSharedFile({ id: '123', status: shareStatus.accepted })],
              totalFilesCount: { files: 0, folders: 1 }
            })
          })
          expect(wrapper.find(selectors.pendingTable).exists()).toBeFalsy()
        })
      })

      describe('when there is a pending share to be displayed', () => {
        it('should show the pending shares list', () => {
          const wrapper = getMountedWrapper({
            store: getStore({
              activeFiles: [createSharedFile({ id: '123', status: shareStatus.pending })],
              totalFilesCount: { files: 0, folders: 1 }
            })
          })
          expect(wrapper.find(selectors.pendingTable).exists()).toBeTruthy()
          expect(wrapper.findAll(selectors.pendingTableRow).length).toBeGreaterThan(0)
        })
      })

      describe('when there are a lot of pending shares to be displayed', () => {
        const pendingShares = [
          createSharedFile({ id: '123', status: shareStatus.pending }),
          createSharedFile({ id: '234', status: shareStatus.pending }),
          createSharedFile({ id: '345', status: shareStatus.pending }),
          createSharedFile({ id: '456', status: shareStatus.pending }),
          createSharedFile({ id: '567', status: shareStatus.pending })
        ]
        const wrapper = getMountedWrapper({
          store: getStore({
            activeFiles: pendingShares,
            totalFilesCount: { files: 0, folders: pendingShares.length }
          })
        })
        describe('as long as the pending shares are collapsed', () => {
          it('should show only three pending shares', () => {
            expect(wrapper.findAll(selectors.pendingTableRow).length).toBe(3)
          })
          it('should show a control for expanding all pending shares', () => {
            expect(wrapper.find(selectors.pendingExpand).exists()).toBeTruthy()
          })
        })
        describe('as soon as the pending shares are expanded', () => {
          let wrapper
          beforeEach(async () => {
            wrapper = getMountedWrapper({
              store: getStore({
                activeFiles: pendingShares,
                totalFilesCount: { files: 0, folders: pendingShares.length }
              })
            })
            await wrapper.find(selectors.pendingExpand).trigger('click')
          })
          it('should show all pending shares', () => {
            expect(wrapper.findAll(selectors.pendingTableRow).length).toBe(pendingShares.length)
          })
          it('should show a control for collapsing the pending shares', () => {
            expect(wrapper.find(selectors.pendingCollapse).exists()).toBeTruthy()
          })
        })
      })
    })

    describe('when there are no accepted shares to be displayed', () => {
      const wrapper = getMountedWrapper()
      it('should show a "no content" message', () => {
        expect(wrapper.find(selectors.sharesNoContentMessage).exists()).toBeTruthy()
      })
      it('should not show the accepted shares list', () => {
        expect(wrapper.find(selectors.sharesTable).exists()).toBeFalsy()
      })
    })

    describe('when there are accepted shares to be displayed', () => {
      const wrapper = getMountedWrapper({
        store: getStore({
          activeFiles: [createSharedFile({ id: '123', status: shareStatus.accepted })],
          totalFilesCount: { files: 0, folders: 1 }
        })
      })
      it('should not show a "no content" message', () => {
        expect(wrapper.find(selectors.sharesNoContentMessage).exists()).toBeFalsy()
      })
      it('should show the accepted shares list', () => {
        expect(wrapper.find(selectors.sharesTable).exists()).toBeTruthy()
        expect(wrapper.findAll(selectors.sharesTableRow).length).toBeGreaterThan(0)
      })
      it('should show a link to the declined shares', () => {
        const link = wrapper.find(selectors.sharesToggleViewMode)
        expect(link.attributes()['data-test-set-view-mode']).toBe(shareStatus.declined.toString())
      })
    })

    describe('when there are one or more declined shares to be displayed', () => {
      const wrapper = getMountedWrapper({
        store: getStore({
          activeFiles: [createSharedFile({ id: '123', status: shareStatus.declined })],
          totalFilesCount: { files: 0, folders: 1 }
        }),
        viewMode: shareStatus.declined
      })
      it('should not show a "no content" message', () => {
        expect(wrapper.find(selectors.sharesNoContentMessage).exists()).toBeFalsy()
      })
      it('should show the declined shares list', () => {
        expect(wrapper.find(selectors.sharesTable).exists()).toBeTruthy()
        expect(wrapper.findAll(selectors.sharesTableRow).length).toBeGreaterThan(0)
      })
      it('should show a link to the accepted shares', () => {
        const link = wrapper.find(selectors.sharesToggleViewMode)
        expect(link.attributes()['data-test-set-view-mode']).toBe(shareStatus.accepted.toString())
      })
    })
  })
})

function mountOptions({
  store = getStore({
    activeFiles: [],
    totalFilesCount: { files: 0, folders: 0 }
  }),
  loading = false,
  viewMode = shareStatus.accepted
} = {}) {
  return {
    localVue,
    store,
    stubs,
    mocks: {
      $route: {
        name: 'some-route',
        query: { page: 1, 'view-mode': viewMode }
      }
    },
    data: () => ({
      loading
    })
  }
}

function getMountedWrapper({ store, loading, viewMode } = {}) {
  const component = { ...SharedWithMe, created: jest.fn(), mounted: jest.fn() }
  return mount(component, mountOptions({ store, loading, viewMode }))
}

function createSharedFile({ id, shareType = shareTypes.user, status = shareStatus.pending }) {
  return {
    id: `share-id-${id}`,
    share_type: shareType,
    status
  }
}

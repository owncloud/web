import { mount } from '@vue/test-utils'
import { localVue, getStore, getRouter } from '../views.setup'
import SharedWithMe from '@files/src/views/shares/SharedWithMe.vue'
import { ShareStatus, ShareTypes } from '@files/src/helpers/share'
import { extractDomSelector } from '../../../../src/helpers/resource'
import Users from '@/__fixtures__/users'

const stubs = {
  'app-bar': true,
  'router-link': true,
  translate: true,
  'oc-pagination': true,
  'oc-spinner': true,
  'context-actions': true,
  'no-content-message': true
}

const selectors = {
  pendingTable: '#files-shared-with-me-pending-section .files-table',
  pendingTableRow: '#files-shared-with-me-pending-section tbody > tr.oc-tbody-tr',
  pendingExpand:
    '#files-shared-with-me-pending-section #files-shared-with-me-show-all[data-test-expand="true"]',
  pendingCollapse:
    '#files-shared-with-me-pending-section #files-shared-with-me-show-all[data-test-expand="false"]',
  acceptedNoContentMessage: '#files-shared-with-me-accepted-section .files-empty',
  declinedNoContentMessage: '#files-shared-with-me-declined-section .files-empty',
  acceptedTable: '#files-shared-with-me-accepted-section .files-table',
  declinedTable: '#files-shared-with-me-declined-section .files-table',
  acceptedTableRow: '#files-shared-with-me-accepted-section tbody > tr.oc-tbody-tr',
  declinedTableRow: '#files-shared-with-me-declined-section tbody > tr.oc-tbody-tr',
  sharesToggleViewMode: '#files-shared-with-me-toggle-view-mode'
}

const spinnerStub = 'oc-spinner-stub'

describe('SharedWithMe view', () => {
  describe('when the view is still loading', () => {
    it('should show the loading indicator', () => {
      const wrapper = getMountedWrapper({ loading: true })
      expect(wrapper.find(spinnerStub).exists()).toBeTruthy()
    })
    it('should not show other components', () => {
      const wrapper = getMountedWrapper({ loading: true })
      expect(wrapper.find(selectors.pendingTable).exists()).toBeFalsy()
      expect(wrapper.find(selectors.acceptedTable).exists()).toBeFalsy()
      expect(wrapper.find(selectors.declinedTable).exists()).toBeFalsy()
      expect(wrapper.find(selectors.acceptedNoContentMessage).exists()).toBeFalsy()
      expect(wrapper.find(selectors.declinedNoContentMessage).exists()).toBeFalsy()
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
          const file = createSharedFile({ id: '123', status: ShareStatus.accepted })
          const wrapper = getMountedWrapper({
            store: getStore({
              highlightedFile: file,
              activeFiles: [file],
              totalFilesCount: { files: 0, folders: 1 },
              user: { id: Users.alice.id }
            })
          })
          expect(wrapper.find(selectors.pendingTable).exists()).toBeFalsy()
        })
      })

      describe('when there is a pending share to be displayed', () => {
        it('should show the pending shares list', () => {
          const file = createSharedFile({ id: '123', status: ShareStatus.pending })
          const wrapper = getMountedWrapper({
            store: getStore({
              highlightedFile: file,
              activeFiles: [file],
              totalFilesCount: { files: 0, folders: 1 },
              user: { id: Users.alice.id }
            })
          })
          expect(wrapper.find(selectors.pendingTable).exists()).toBeTruthy()
          expect(wrapper.findAll(selectors.pendingTableRow).length).toBeGreaterThan(0)
        })
      })

      describe('when there are a lot of pending shares to be displayed', () => {
        const pendingShares = [
          createSharedFile({ id: '123', status: ShareStatus.pending }),
          createSharedFile({ id: '234', status: ShareStatus.pending }),
          createSharedFile({ id: '345', status: ShareStatus.pending }),
          createSharedFile({ id: '456', status: ShareStatus.pending }),
          createSharedFile({ id: '567', status: ShareStatus.pending })
        ]
        const wrapper = getMountedWrapper({
          store: getStore({
            highlightedFile: pendingShares[0],
            activeFiles: pendingShares,
            totalFilesCount: { files: 0, folders: pendingShares.length },
            user: { id: Users.alice.id }
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
                highlightedFile: pendingShares[0],
                activeFiles: pendingShares,
                totalFilesCount: { files: 0, folders: pendingShares.length },
                user: { id: Users.alice.id }
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
        expect(wrapper.find(selectors.acceptedNoContentMessage).exists()).toBeTruthy()
      })
      it('should not show the accepted shares list', () => {
        expect(wrapper.find(selectors.acceptedTable).exists()).toBeFalsy()
      })
    })

    describe('when there are accepted shares to be displayed', () => {
      const file = createSharedFile({ id: '123', status: ShareStatus.accepted })
      const wrapper = getMountedWrapper({
        store: getStore({
          highlightedFile: file,
          activeFiles: [file],
          totalFilesCount: { files: 0, folders: 1 },
          user: { id: Users.alice.id }
        })
      })
      it('should not show a "no content" message', () => {
        expect(wrapper.find(selectors.acceptedNoContentMessage).exists()).toBeFalsy()
      })
      it('should show the accepted shares list', () => {
        expect(wrapper.find(selectors.acceptedTable).exists()).toBeTruthy()
        expect(wrapper.findAll(selectors.acceptedTableRow).length).toBeGreaterThan(0)
      })
    })

    describe('when there are one or more declined shares to be displayed', () => {
      const file = createSharedFile({ id: '123', status: ShareStatus.declined })
      const wrapper = getMountedWrapper({
        store: getStore({
          highlightedFile: file,
          activeFiles: [file],
          totalFilesCount: { files: 0, folders: 1 },
          user: { id: Users.alice.id }
        }),
        viewMode: ShareStatus.declined
      })
      it('should not show a "no content" message', async () => {
        const noContentMessage = await wrapper.find(selectors.declinedNoContentMessage)
        expect(noContentMessage.exists()).toBeFalsy()
      })
      it('should show the declined shares list', () => {
        expect(wrapper.find(selectors.declinedTable).exists()).toBeTruthy()
        expect(wrapper.findAll(selectors.declinedTableRow).length).toBeGreaterThan(0)
      })
    })
  })
})

function mountOptions({
  store = getStore({
    activeFiles: [],
    totalFilesCount: { files: 0, folders: 0 },
    user: { id: Users.alice.id }
  }),
  loading = false,
  viewMode = ShareStatus.accepted
} = {}) {
  const query = { page: 1, 'view-mode': viewMode }
  return {
    localVue,
    store,
    stubs,
    mocks: {
      $route: {
        name: 'some-route',
        query
      },
      $router: getRouter({ query })
    },
    setup: () => ({
      areResourcesLoading: loading,
      loadResourcesTask: {
        perform: jest.fn()
      },
      pendingHandleSort: jest.fn(),
      acceptedHandleSort: jest.fn(),
      declinedHandleSort: jest.fn(),
      pendingSortBy: '',
      acceptedSortBy: '',
      declinedSortBy: ''
    })
  }
}

function getMountedWrapper({ store, loading, viewMode } = {}) {
  const component = { ...SharedWithMe, created: jest.fn(), mounted: jest.fn() }
  return mount(component, mountOptions({ store, loading, viewMode }))
}

function createSharedFile({ id, shareType = ShareTypes.user.value, status = ShareStatus.pending }) {
  const idProp = `share-id-${id}`
  return {
    id: idProp,
    share_type: shareType,
    status,
    getDomSelector: () => extractDomSelector(idProp)
  }
}

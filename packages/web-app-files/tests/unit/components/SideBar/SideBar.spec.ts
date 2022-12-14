import fileSideBars from 'web-app-files/src/fileSideBars'
import InnerSideBar from 'web-pkg/src/components/sideBar/SideBar.vue'
import SideBar from 'web-app-files/src/components/SideBar/SideBar.vue'
import { Resource } from 'web-client/src/helpers'
import { mockDeep } from 'jest-mock-extended'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  defaultStubs,
  shallowMount
} from 'web-test-helpers'
import { defaultStoreMockOptions } from 'web-test-helpers/src/mocks/store/defaultStoreMockOptions'

jest.mock('web-pkg/src/observer')
jest.mock('web-app-files/src/helpers/resources', () => {
  const original = jest.requireActual('web-app-files/src/helpers/resources')
  return {
    ...original,
    buildResource: jest.fn()
  }
})

const selectors = {
  noSelectionInfoPanel: 'noselection-stub'
}

describe('SideBar', () => {
  describe('no selection info panel', () => {
    afterEach(() => {
      jest.clearAllMocks()
    })
    describe('for public links', () => {
      it.each([
        [
          'shows in root node',
          {
            path: '',
            noSelectionExpected: true
          }
        ],
        [
          'does not show in non-root node',
          {
            path: '/publicLinkToken/some-folder',
            noSelectionExpected: false
          }
        ]
      ])('%s', async (name, { path, noSelectionExpected }) => {
        const item = mockDeep<Resource>({ path })
        const { wrapper } = createWrapper({ item })
        await wrapper.vm.$nextTick()
        expect(wrapper.find(selectors.noSelectionInfoPanel).exists()).toBe(noSelectionExpected)
      })
    })
    describe('for all files', () => {
      it.each([
        [
          'shows in root node',
          {
            path: '/',
            noSelectionExpected: true
          }
        ],
        [
          'does not show in non-root node',
          {
            path: '/some-folder',
            noSelectionExpected: false
          }
        ]
      ])('%s', async (name, { path, noSelectionExpected }) => {
        const item = mockDeep<Resource>({ path })
        const { wrapper } = createWrapper({ item })
        await wrapper.vm.$nextTick()
        expect(wrapper.find(selectors.noSelectionInfoPanel).exists()).toBe(noSelectionExpected)
      })
    })
  })
})

function createWrapper({ item = undefined } = {}) {
  const storeOptions = {
    ...defaultStoreMockOptions,
    getters: {
      ...defaultStoreMockOptions.getters,
      user: function () {
        return { id: 'marie' }
      },
      capabilities: () => ({
        files_sharing: {
          api_enabled: true,
          public: { enabled: true }
        }
      })
    }
  }
  storeOptions.modules.apps.getters.fileSideBars.mockImplementation(() => fileSideBars)
  storeOptions.modules.Files.state.highlightedFile = item
  storeOptions.modules.Files.getters.highlightedFile.mockImplementation(
    (state) => state.highlightedFile
  )
  const store = createStore(storeOptions)
  return {
    wrapper: shallowMount(SideBar, {
      props: {
        open: true
      },
      global: {
        plugins: [...defaultPlugins(), store],
        stubs: {
          ...defaultStubs,
          SideBar: InnerSideBar
        },
        directives: {
          'click-outside': jest.fn()
        },
        mocks: {
          ...defaultComponentMocks()
        }
      }
    })
  }
}

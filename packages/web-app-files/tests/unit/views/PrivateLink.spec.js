import { shallowMount } from '@vue/test-utils'
import { getRouter, getStore, localVue } from './views.setup'
import PrivateLink from '@files/src/views/PrivateLink.vue'
import fileFixtures from '../../../../../__fixtures__/files'

localVue.prototype.$client.files = {
  getPathForFileId: jest.fn(() => Promise.resolve('/lorem.txt'))
}

const theme = {
  general: { slogan: 'some-slogan' }
}

const $route = {
  params: {
    fileId: '2147491323'
  },
  meta: {
    title: 'Resolving private link'
  }
}

const selectors = {
  pageTitle: 'h1.oc-invisible-sr',
  loader: '.oc-card-body',
  errorTitle: '.oc-link-resolve-error-title'
}

describe('PrivateLink view', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('when the page has loaded successfully', () => {
    let wrapper
    beforeEach(() => {
      wrapper = getShallowWrapper()
    })

    it('should display the page title', () => {
      expect(wrapper.find(selectors.pageTitle)).toMatchSnapshot()
    })
    it('should resolve the provided file id to a path', () => {
      expect(wrapper.vm.$client.files.getPathForFileId).toHaveBeenCalledTimes(1)
    })
  })

  describe('when the view is still loading', () => {
    it('should display the loading text with the spinner', () => {
      const wrapper = getShallowWrapper(true)

      expect(wrapper.find(selectors.loader)).toMatchSnapshot()
    })
  })

  describe('when there was an error', () => {
    it('should display the error message', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {})
      const wrapper = getShallowWrapper(
        false,
        jest.fn(() => Promise.reject(Error('some error')))
      )

      await new Promise((resolve) => {
        setTimeout(() => {
          expect(wrapper.find(selectors.errorTitle)).toMatchSnapshot()
          resolve()
        }, 1)
      })
    })
  })

  describe('when the view has finished loading and there was no error', () => {
    it('should not display the loading text and the error message', () => {
      const wrapper = getShallowWrapper()

      expect(wrapper).toMatchSnapshot()
    })
  })
})

function getShallowWrapper(loading = false, getPathForFileIdMock = jest.fn()) {
  return shallowMount(PrivateLink, {
    localVue,
    store: createStore(),
    mocks: {
      $route,
      $router: getRouter({}),
      $client: {
        files: {
          fileInfo: jest.fn().mockImplementation(() => Promise.resolve(fileFixtures['/'][4])),
          getPathForFileId: getPathForFileIdMock
        }
      }
    },
    data() {
      return {
        loading
      }
    }
  })
}

function createStore() {
  return getStore({
    slogan: theme.general.slogan,
    user: { id: 1 }
  })
}

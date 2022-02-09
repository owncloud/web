import { shallowMount } from '@vue/test-utils'
import { getRouter, getStore, localVue } from './views.setup'
import PrivateLink from '@files/src/views/PrivateLink.vue'

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
  errorMessage: '.oc-link-resolve-error'
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
      expect(localVue.prototype.$client.files.getPathForFileId).toHaveBeenCalledTimes(1)
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
      const errMsg = 'some error'
      localVue.prototype.$client.files = {
        getPathForFileId: jest.fn(() => Promise.reject(Error(errMsg)))
      }
      const wrapper = getShallowWrapper()

      await new Promise((resolve) => {
        setTimeout(() => {
          expect(wrapper.find(selectors.errorMessage)).toMatchSnapshot()
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

function getShallowWrapper(loading = false) {
  return shallowMount(PrivateLink, {
    localVue,
    store: createStore(),
    mocks: {
      $route,
      $router: getRouter({})
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
    slogan: theme.general.slogan
  })
}

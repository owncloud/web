import { shallowMount } from '@vue/test-utils'
import { getStore, localVue } from './views.setup'
import PrivateLink from '@files/src/views/PrivateLink.vue'

localVue.prototype.$client.files = {
  getPathForFileId: jest.fn(() => Promise.resolve('/lorem.txt'))
}

const backgroundImgPath = 'assets/loginBackground.jpg'
const loginLogoPath = 'assets/logo.svg'

const $route = {
  params: {
    fileId: '2147491323'
  },
  meta: {
    title: 'Resolving private link'
  }
}

const selectors = {
  backgroundImg: '.oc-login',
  pageTitle: 'h1.oc-invisible-sr',
  loginLogo: '.oc-login-logo',
  loader: '.oc-login-card-body',
  errorMessage: '.oc-login-card-body'
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

    it('should have the background image set', () => {
      const backgroundImg = wrapper.find(selectors.backgroundImg)

      expect(backgroundImg.exists()).toBeTruthy()
      expect(backgroundImg.attributes().style).toEqual(
        `background-image: url(${backgroundImgPath});`
      )
    })
    it('should display the page title', () => {
      expect(wrapper.find(selectors.pageTitle)).toMatchSnapshot()
    })
    it('should display the logo', () => {
      const loginLogo = wrapper.find(selectors.loginLogo)

      expect(loginLogo.exists()).toBeTruthy()
      expect(loginLogo.attributes().src).toEqual(loginLogoPath)
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
      $router: []
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
    loginBackgroundImg: backgroundImgPath,
    loginLogo: loginLogoPath
  })
}

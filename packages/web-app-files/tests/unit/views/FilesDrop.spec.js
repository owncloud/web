import FilesDrop from '@files/src/views/FilesDrop.vue'
import { shallowMount } from '@vue/test-utils'
import GetTextPlugin from 'vue-gettext'
import { getStore, localVue } from './views.setup.js'
import { DavProperty } from 'web-pkg/src/constants'
import { linkRoleUploaderFolder } from '@files/src/helpers/share'
import VueCompositionAPI from '@vue/composition-api/dist/vue-composition-api'

localVue.use(VueCompositionAPI)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

localVue.prototype.$client.publicFiles = {
  PUBLIC_LINK_SHARE_OWNER: 'admin',
  // function is mocked because it should return a promise with a list of resources
  list: async () => [
    {
      getProperty: jest.fn((val) => {
        if (val === DavProperty.PublicLinkPermission) {
          return linkRoleUploaderFolder.bitmask(false)
        }
        return val
      })
    }
  ],
  // function takes token as an argument and is mocked because it should return some public link url
  getFileUrl: (token) => `http://some-url/${token}`,
  putFileContents: jest.fn()
}

const $route = {
  meta: {
    title: 'page route title'
  },
  params: {
    token: 'abc123def456'
  }
}

const selectors = {
  filesEmpty: '.files-empty',
  loadingHeader: '.oc-login-card-title'
}

const ocSpinnerStubSelector = 'oc-spinner-stub'

describe('FilesDrop', () => {
  it('should call "resolvePublicLink" method on wrapper mount', () => {
    const spyResolvePublicLink = jest.spyOn(FilesDrop.methods, 'resolvePublicLink')
    getShallowWrapper()

    expect(spyResolvePublicLink).toHaveBeenCalledTimes(1)
  })

  it('should show page title and configuration theme general slogan', () => {
    const wrapper = getShallowWrapper()

    expect(wrapper).toMatchSnapshot()
  })

  it('should show spinner with loading text if wrapper is loading', () => {
    const wrapper = getShallowWrapper({ loading: true })

    expect(wrapper.find(selectors.loadingHeader).exists()).toBeTruthy()
    expect(wrapper.find(ocSpinnerStubSelector).exists()).toBeTruthy()
    expect(wrapper).toMatchSnapshot()
  })

  describe('when "loading" is set to false', () => {
    const wrapper = getShallowWrapper()

    it('should not show spinner and loading header', () => {
      expect(wrapper.find(selectors.loadingHeader).exists()).toBeFalsy()
      expect(wrapper.find(ocSpinnerStubSelector).exists()).toBeFalsy()
    })

    it('should show share information title', () => {
      expect(wrapper).toMatchSnapshot()
    })

    it('should show vue drop zone with given options', () => {
      const dropZone = wrapper.find('#files-drop-zone')
      expect(dropZone.exists()).toBeTruthy()
    })

    it('should show error message if only it has truthy value', () => {
      const wrapper = getShallowWrapper({
        loading: false,
        errorMessage: 'This is a test error message'
      })

      expect(wrapper).toMatchSnapshot()
    })
  })
})

function createStore(slogan = 'some slogan', davProperties = []) {
  return getStore({ slogan, davProperties })
}

function getShallowWrapper({ store = createStore(), loading = false, errorMessage = null } = {}) {
  return shallowMount(FilesDrop, {
    localVue,
    store,
    mocks: {
      $route,
      $router: {
        currentRoute: { name: 'some-route' },
        resolve: (r) => {
          return { href: r.name }
        },
        afterEach: jest.fn()
      },
      $uppyService: {
        $on: jest.fn(),
        useDropTarget: jest.fn(),
        useXhr: jest.fn()
      }
    },
    setup: () => {
      return {}
    },
    data() {
      return {
        loading: loading,
        errorMessage: errorMessage,
        share: {
          getProperty: (val) => val
        }
      }
    }
  })
}

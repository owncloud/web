import Vuex from 'vuex'
import GetTextPlugin from 'vue-gettext'
import DesignSystem from 'owncloud-design-system'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import PrivateLinkItem from '@files/src/components/SideBar/Links/PrivateLinkItem.vue'

const selectors = {
  linkItem: '.oc-files-private-link-item',
  linkItemHyperlink: '.oc-files-private-link-item a',
  copyToClipboardButton: '.oc-files-private-link-copy-url'
}

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(DesignSystem)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

global.window = Object.create(window)
const windowLocation = { href: 'http://localhost:9100' }
Object.defineProperty(window, 'location', {
  value: windowLocation
})

describe('PrivateLinkItem', () => {
  describe('when the private link functionality is enabled', () => {
    it('should be visible', () => {
      const store = createStore()
      const wrapper = getShallowWrapper(store, false)

      expect(wrapper.find(selectors.linkItem).exists()).toBeTruthy()
    })

    it('should render the copy-to-clipboard button', () => {
      const store = createStore()
      const wrapper = getShallowWrapper(store, false)

      const copyToClipboardButtonElement = wrapper.find(selectors.copyToClipboardButton)

      expect(copyToClipboardButtonElement.exists()).toBeTruthy()
      expect(copyToClipboardButtonElement.attributes().label).toBe('Copy private link to clipboard')
      expect(copyToClipboardButtonElement.attributes().successmsgtitle).toBe('Private link copied')
      expect(copyToClipboardButtonElement.attributes().successmsgtext).toBe(
        'The private link has been copied to your clipboard.'
      )
    })

    describe('link item hyperlink', () => {
      it('should render a hyperlink with href containing the scrollTo payload as a link if the highlighted file is mounted', () => {
        const store = createStore()
        const wrapper = getShallowWrapper(store)

        expect(wrapper.find(selectors.linkItemHyperlink).attributes().href).toBe(
          `${windowLocation.href}?scrollTo=${store.getters['Files/highlightedFile'].name}`
        )
      })

      it('should render a hyperlink with href and text as a private link if the highlighted file is not mounted', () => {
        const store = createStore({ isMounted: false })
        const wrapper = getShallowWrapper(store, false)

        expect(wrapper.find(selectors.linkItemHyperlink).attributes().href).toBe('some-link')
        expect(wrapper.find(selectors.linkItemHyperlink).text()).toBe('some-link')
      })
    })
  })
})

const getTestFolder = isMounted => ({
  type: 'folder',
  ownerId: 'marie',
  ownerDisplayName: 'Marie',
  mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  size: '740',
  isMounted: jest.fn(() => isMounted),
  name: 'lorem.txt',
  privateLink: 'some-link'
})

function createStore({ isMounted = true } = {}) {
  return new Vuex.Store({
    getters: {
      capabilities: function() {
        return {
          files: {
            privateLinks: true
          }
        }
      }
    },
    modules: {
      Files: {
        namespaced: true,
        getters: {
          highlightedFile: () => getTestFolder(isMounted)
        }
      }
    }
  })
}

function getShallowWrapper(store, isMounted = true) {
  return shallowMount(PrivateLinkItem, {
    localVue,
    store,
    stubs: {
      'copy-to-clipboard-button': true
    },
    provide: {
      displayedItem: {
        value: getTestFolder(isMounted)
      }
    }
  })
}

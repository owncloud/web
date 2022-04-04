import Vuex from 'vuex'
import GetTextPlugin from 'vue-gettext'
import DesignSystem from 'owncloud-design-system'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import PrivateLinkItem from '@files/src/components/SideBar/PrivateLinkItem.vue'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(DesignSystem)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

describe('PrivateLinkItem', () => {
  it('should render the copy-to-clipboard button and a success message upon clicking it', () => {
    const store = createStore()
    const wrapper = getShallowWrapper(store)
    const copyToClipboardButtonElement = wrapper.find('.oc-files-private-link-copy-url')

    expect(copyToClipboardButtonElement.exists()).toBeTruthy()
    expect(copyToClipboardButtonElement.attributes().text).toBe('Private link')
    expect(copyToClipboardButtonElement.attributes().label).toBe('Copy private link to clipboard')
    expect(copyToClipboardButtonElement.attributes().successmsgtitle).toBe('Private link copied')
    expect(copyToClipboardButtonElement.attributes().successmsgtext).toBe(
      'The private link has been copied to your clipboard.'
    )
  })
})

const getTestFolder = () => ({
  type: 'folder',
  ownerId: 'marie',
  ownerDisplayName: 'Marie',
  mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  size: '740',
  name: 'lorem.txt',
  privateLink: 'some-link'
})

function createStore() {
  return new Vuex.Store({
    getters: {
      capabilities: function () {
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
          highlightedFile: () => getTestFolder()
        }
      }
    }
  })
}

function getShallowWrapper(store) {
  return shallowMount(PrivateLinkItem, {
    localVue,
    store,
    stubs: {
      'copy-to-clipboard-button': true
    },
    provide: {
      displayedItem: {
        value: getTestFolder()
      }
    }
  })
}

import Vuex from 'vuex'
import GetTextPlugin from 'vue-gettext'
import DesignSystem from 'owncloud-design-system'
import { mount, createLocalVue } from '@vue/test-utils'
import PrivateLinkItem from 'web-app-files/src/components/SideBar/PrivateLinkItem.vue'

jest.useFakeTimers()

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(DesignSystem)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const mapActions = {
  showMessage: jest.fn()
}

describe('PrivateLinkItem', () => {
  it('should render a button', () => {
    const store = createStore()
    const wrapper = getWrapper(store)

    expect(wrapper).toMatchSnapshot()
  })
  it('upon clicking it should copy the private link to the clipboard button, render a success message and change icon for half a second', async () => {
    const spyShowMessage = jest.spyOn(mapActions, 'showMessage')
    jest.spyOn(window, 'prompt').mockImplementation()

    const store = createStore()
    const wrapper = getWrapper(store)

    expect(spyShowMessage).not.toHaveBeenCalled()

    await wrapper.trigger('click')

    expect(wrapper).toMatchSnapshot()

    expect(spyShowMessage).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(550)

    wrapper.vm.$nextTick(() => {
      expect(wrapper).toMatchSnapshot()
    })
  })
})

const getTestFolder = () => ({
  type: 'folder',
  ownerId: 'marie',
  ownerDisplayName: 'Marie',
  mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  size: '740',
  name: 'lorem.txt',
  privateLink: 'https://example.com/fake-private-link'
})

function createStore() {
  return new Vuex.Store({
    actions: mapActions,
    commit: jest.fn(),
    dispatch: jest.fn(),
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

function getWrapper(store) {
  return mount(PrivateLinkItem, {
    localVue,
    store,
    provide: {
      displayedItem: {
        value: getTestFolder()
      }
    }
  })
}

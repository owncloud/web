import { createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import GetTextPlugin from 'vue-gettext'
import DesignSystem from 'owncloud-design-system'
import NameAndCopy from 'web-app-files/src/components/SideBar/Shares/Links/NameAndCopy.vue'

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

const exampleLink = {
  name: 'Example link',
  url: 'https://some-url.com/abc'
}

describe('NameAndCopy', () => {
  it('should show link info component including a copy-to-clipboard button', () => {
    const wrapper = getWrapper()
    expect(wrapper).toMatchSnapshot()
  })
  it('upon clicking it should copy the private link to the clipboard button, render a success message and change icon for half a second', async () => {
    const spyShowMessage = jest.spyOn(mapActions, 'showMessage')
    const windowSpy = jest.spyOn(window, 'prompt').mockImplementation()

    const store = createStore()
    const wrapper = getWrapper(store)

    expect(spyShowMessage).not.toHaveBeenCalled()
    expect(windowSpy).not.toHaveBeenCalled()

    await wrapper.find('.oc-files-public-link-copy-url').trigger('click')

    expect(wrapper).toMatchSnapshot()

    expect(spyShowMessage).toHaveBeenCalledTimes(1)
    expect(windowSpy).toHaveBeenCalledTimes(1)
    expect(windowSpy).toHaveBeenCalledWith('Copy to clipboard: Ctrl+C, Enter', exampleLink.url)

    jest.advanceTimersByTime(550)

    wrapper.vm.$nextTick(() => {
      expect(wrapper).toMatchSnapshot()
    })
  })
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
    }
  })
}

function getWrapper(store) {
  return mount(NameAndCopy, {
    localVue,
    store,
    propsData: {
      link: exampleLink
    },
    directives: {
      'oc-tooltip': jest.fn()
    }
  })
}

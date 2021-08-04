import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import CopyToClipboardButton from '../../../../../src/components/SideBar/Links/CopyToClipboardButton.vue'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
jest.useFakeTimers()

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(DesignSystem)

describe('CopyToClipboardButton', () => {
  const selectors = {
    copiedIcon: '._clipboard-success-animation'
  }
  const mapActions = {
    showMessage: jest.fn()
  }
  function createStore() {
    return new Vuex.Store({
      actions: mapActions,
      commit: jest.fn(),
      dispatch: jest.fn()
    })
  }
  function getShallowWrapper(copied = false) {
    return shallowMount(CopyToClipboardButton, {
      localVue,
      store: createStore(),
      propsData: {
        value: 'test string',
        label: 'test label',
        successMsgTitle: 'test success',
        successMsgText: 'test success text'
      },
      data() {
        return {
          copied: copied
        }
      },
      stubs: {
        'oc-icon': true,
        'oc-button': true
      },
      directives: {
        'oc-tooltip': jest.fn()
      }
    })
  }

  function getMountedWrapper() {
    return mount(CopyToClipboardButton, {
      localVue,
      store: createStore(),
      propsData: {
        value: 'test string',
        label: 'test label',
        successMsgTitle: 'test success',
        successMsgText: 'test success text'
      },
      directives: {
        'oc-tooltip': jest.fn()
      },
      stubs: {
        'oc-icon': true,
        'oc-button': false
      }
    })
  }

  it('should set provided label as button aria label', () => {
    const wrapper = getShallowWrapper()

    expect(wrapper.attributes('arialabel')).toBe('test label')
  })

  describe('copy to clipboard copied icon', () => {
    it('should be visible if copied is true', () => {
      const wrapper = getShallowWrapper(true)

      expect(wrapper.find(selectors.copiedIcon).exists()).toBeTruthy()
    })
    it('should not be visible if copied if false', () => {
      const wrapper = getShallowWrapper()

      expect(wrapper.find(selectors.copiedIcon).exists()).toBeFalsy()
    })
  })
  describe('when button is clicked', () => {
    const spyShowMessage = jest.spyOn(mapActions, 'showMessage')
    const windowSpy = jest.spyOn(window, 'prompt').mockImplementation()
    const wrapper = getMountedWrapper()

    it('should copy value to clipboard', async () => {
      console.log(wrapper.html())
      await wrapper.find('button').trigger('click')
      expect(windowSpy).toHaveBeenCalledTimes(1)
      expect(windowSpy).toHaveBeenCalledWith('Copy to clipboard: Ctrl+C, Enter', 'test string')
    })

    it('should trigger showMessage store action', () => {
      expect(spyShowMessage).toHaveBeenCalledTimes(1)
    })

    it('should set copied to true and then to false after timeout', () => {
      expect(wrapper.vm.copied).toBeTruthy()
      jest.advanceTimersByTime(550)
      expect(wrapper.vm.copied).toBeFalsy()
    })
  })
})

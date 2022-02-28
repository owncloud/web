import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import CopyToClipboardButton from '@files/src/components/SideBar/Links/CopyToClipboardButton.vue'

jest.useFakeTimers()

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(DesignSystem)

const selectors = {
  copiedIcon: '._clipboard-success-animation'
}

const mapActions = {
  showMessage: jest.fn()
}

describe('CopyToClipboardButton', () => {
  it('should set provided label as button aria label', () => {
    const wrapper = getShallowWrapper()

    expect(wrapper.attributes('arialabel')).toBe('test label')
  })

  describe('copy to clipboard copied icon', () => {
    it('should be visible if copied is set to true', () => {
      const wrapper = getShallowWrapper(true)

      expect(wrapper.find(selectors.copiedIcon).exists()).toBeTruthy()
    })

    it('should not be visible if copied is set to false', () => {
      const wrapper = getShallowWrapper()

      expect(wrapper.find(selectors.copiedIcon).exists()).toBeFalsy()
    })
  })
  describe('when the button is clicked', () => {
    const spyShowMessage = jest.spyOn(mapActions, 'showMessage')
    const windowSpy = jest.spyOn(window, 'prompt').mockImplementation()
    const wrapper = getMountedWrapper()

    it('should copy the value to the clipboard and trigger the showMessage store action', async () => {
      expect(spyShowMessage).not.toHaveBeenCalled()
      expect(windowSpy).not.toHaveBeenCalled()

      await wrapper.trigger('click')

      expect(spyShowMessage).toHaveBeenCalledTimes(1)
      expect(windowSpy).toHaveBeenCalledTimes(1)
      expect(windowSpy).toHaveBeenCalledWith('Copy to clipboard: Ctrl+C, Enter', 'test string')
      expect(wrapper.find(selectors.copiedIcon).exists()).toBeTruthy()
    })

    it('should set copied to true and then to false after a timeout', () => {
      // constant set in wrapper component
      const clipboardSuccessHandlerTimeout = 550
      expect(wrapper.vm.copied).toBeTruthy()
      expect(wrapper.find(selectors.copiedIcon).exists()).toBeTruthy()

      jest.advanceTimersByTime(clipboardSuccessHandlerTimeout)

      wrapper.vm.$nextTick(() => {
        expect(wrapper.vm.copied).toBeFalsy()
        expect(wrapper.find(selectors.copiedIcon).exists()).toBeFalsy()
      })
    })
  })
})

function createStore() {
  return new Vuex.Store({
    actions: mapActions,
    commit: jest.fn(),
    dispatch: jest.fn()
  })
}

function getMountOptions({
  stubs = {
    'oc-icon': true,
    'oc-button': true
  }
}) {
  return {
    localVue,
    store: createStore(),
    propsData: {
      value: 'test string',
      label: 'test label',
      successMsgTitle: 'test success',
      successMsgText: 'test success text'
    },
    stubs: stubs,
    directives: {
      'oc-tooltip': jest.fn()
    }
  }
}

function getShallowWrapper(copied = false) {
  return shallowMount(CopyToClipboardButton, {
    ...getMountOptions({
      copied: copied,
      stubs: {
        'oc-icon': true,
        'oc-button': true
      }
    }),
    data() {
      return {
        copied: copied
      }
    }
  })
}

function getMountedWrapper() {
  return mount(
    CopyToClipboardButton,
    getMountOptions({
      stubs: {
        'oc-icon': true,
        'oc-button': false
      }
    })
  )
}

import KeyboardActions from '../../../../src/components/FilesList/KeyboardActions.vue'
import { mock } from 'jest-mock-extended'
import { Resource, SpaceResource } from 'web-client/src/helpers'
import { eventBus } from 'web-pkg'
import keycode from 'keycode'

import { defaultStoreMockOptions } from 'web-test-helpers/src/mocks/store/defaultStoreMockOptions'
import { createStore, defaultPlugins, mount } from 'web-test-helpers'
import { useScrollToMock } from 'web-app-files/tests/mocks/useScrollToMock'
import { useScrollTo } from 'web-app-files/src/composables/scrollTo'

jest.mock('web-app-files/src/composables/scrollTo')

describe('KeyboardActions', () => {
  afterEach(() => {
    document.getSelection().empty()
    document.getSelection().removeAllRanges()
  })
  describe('on mount', () => {
    it('subscribes to click events', () => {
      const subscribeSpy = jest.spyOn(eventBus, 'subscribe')
      getWrapper()
      expect(subscribeSpy).toHaveBeenCalledTimes(3)
    })
    it('adds an event listener to the keybind element if given', () => {
      const keybindOnElementId = 'keybind-id'
      document.body.innerHTML = `<div id="${keybindOnElementId}"></div>`
      const element = document.getElementById(keybindOnElementId)
      const subscribeSpy = jest.spyOn(element, 'addEventListener')
      getWrapper({ props: { keybindOnElementId } })
      expect(subscribeSpy).toHaveBeenCalled()
    })
  })
  describe('custom key bindings', () => {
    const id = 'element-id'

    it.each(['textarea', 'input', 'select'])(
      'are enabled for textarea, input and select elements',
      (elType) => {
        document.body.innerHTML = `<${elType} id="${id}">`
        const element = document.getElementById(id)
        element.focus()

        const { wrapper } = getWrapper()
        const enabled = wrapper.vm.areCustomKeyBindingsEnabled()
        expect(enabled).toBeTruthy()
      }
    )
    it('are enabled when the focused element has a specific data tag', () => {
      document.body.innerHTML = `<div data-custom-key-bindings="true" id="${id}">`
      const element = document.getElementById(id)
      const sel = window.getSelection()
      const range = document.createRange()
      range.selectNodeContents(element)
      sel.addRange(range)
      element.focus()

      const { wrapper } = getWrapper()
      const enabled = wrapper.vm.areCustomKeyBindingsEnabled()
      expect(enabled).toBeTruthy()
    })
    it('are disabled without a selected element', () => {
      document.body.innerHTML = `<div id="${id}">`
      const element = document.getElementById(id)
      element.focus()

      const { wrapper } = getWrapper()
      const enabled = wrapper.vm.areCustomKeyBindingsEnabled()
      expect(enabled).toBeFalsy()
    })
  })
  describe('global shortcuts', () => {
    it('copy selected files', () => {
      const event = new KeyboardEvent('keyDown', {
        keyCode: keycode('c'),
        metaKey: true,
        ctrlKey: true
      })
      const { wrapper, storeOptions } = getWrapper()
      wrapper.vm.handleGlobalShortcuts(event)
      expect(storeOptions.modules.Files.actions.copySelectedFiles).toHaveBeenCalled()
    })
    it('cut selected files', () => {
      const event = new KeyboardEvent('keyDown', {
        keyCode: keycode('x'),
        metaKey: true,
        ctrlKey: true
      })
      const { wrapper, storeOptions } = getWrapper()
      wrapper.vm.handleGlobalShortcuts(event)
      expect(storeOptions.modules.Files.actions.cutSelectedFiles).toHaveBeenCalled()
    })
    it('paste selected files', () => {
      const event = new KeyboardEvent('keyDown', {
        keyCode: keycode('v'),
        metaKey: true,
        ctrlKey: true
      })
      const { wrapper, storeOptions } = getWrapper()
      wrapper.vm.handleGlobalShortcuts(event)
      expect(storeOptions.modules.Files.actions.pasteSelectedFiles).toHaveBeenCalled()
    })
    it('select all files', () => {
      const event = new KeyboardEvent('keyDown', {
        keyCode: keycode('a'),
        metaKey: true,
        ctrlKey: true
      })
      const { wrapper, storeOptions } = getWrapper()
      wrapper.vm.handleGlobalShortcuts(event)
      expect(storeOptions.modules.Files.mutations.SET_FILE_SELECTION).toHaveBeenCalled()
    })
    it.each(['down', 'up'])('navigate via up and down keys', (key) => {
      const event = new KeyboardEvent('keyDown', { keyCode: keycode(key) })
      const { wrapper, storeOptions } = getWrapper()
      wrapper.vm.handleGlobalShortcuts(event)
      expect(storeOptions.modules.Files.mutations.ADD_FILE_SELECTION).toHaveBeenCalled()
    })
    it.each(['down', 'up'])('navigate via shift + up and down keys', (key) => {
      const event = new KeyboardEvent('keyDown', { keyCode: keycode(key), shiftKey: true })
      const { wrapper, storeOptions } = getWrapper({ latestSelectedId: 1 })
      wrapper.vm.handleGlobalShortcuts(event)
      expect(storeOptions.modules.Files.mutations.ADD_FILE_SELECTION).toHaveBeenCalled()
    })
    it('reset the file selection via esc', () => {
      const event = new KeyboardEvent('keyDown', { keyCode: keycode('esc') })
      const { wrapper, storeOptions } = getWrapper()
      wrapper.vm.handleGlobalShortcuts(event)
      expect(storeOptions.modules.Files.actions.resetFileSelection).toHaveBeenCalled()
    })
  })
  describe('shift + click action', () => {
    const resourceId = '1'
    beforeEach(() => {
      document.body.innerHTML = `<table><tr class="oc-tbody-tr" data-item-id="${resourceId}"><td></td></tr></table>`
    })

    it('adds the clicked file to the current selection', () => {
      const { wrapper, storeOptions } = getWrapper()
      wrapper.vm.handleShiftClickAction(mock<Resource>({ id: resourceId }))
      expect(storeOptions.modules.Files.mutations.ADD_FILE_SELECTION).toHaveBeenCalled()
      expect(storeOptions.modules.Files.mutations.SET_LATEST_SELECTED_FILE_ID).toHaveBeenCalled()
    })
  })
  describe('ctrl + click action', () => {
    it('toggles the file selection', () => {
      const { wrapper, storeOptions } = getWrapper()
      wrapper.vm.handleCtrlClickAction(mock<Resource>())
      expect(storeOptions.modules.Files.actions.toggleFileSelection).toHaveBeenCalled()
    })
  })
  describe('local shortcuts', () => {
    it('toggle the file selection on space key', () => {
      const event = new KeyboardEvent('keyDown', { keyCode: keycode('space') })
      const { wrapper, storeOptions } = getWrapper()
      wrapper.vm.handelLocalShortcuts(event)
      expect(storeOptions.modules.Files.actions.toggleFileSelection).toHaveBeenCalled()
    })
  })
})

const getWrapper = ({ props = {}, latestSelectedId = undefined } = {}) => {
  jest.mocked(useScrollTo).mockImplementation(() => useScrollToMock())

  const storeOptions = defaultStoreMockOptions
  storeOptions.modules.Files.state.latestSelectedId = latestSelectedId
  const store = createStore(storeOptions)
  return {
    storeOptions,
    wrapper: mount(KeyboardActions, {
      props: {
        paginatedResources: [
          mock<Resource>({ id: 0 }),
          mock<Resource>({ id: 1 }),
          mock<Resource>({ id: 2 })
        ],
        space: mock<SpaceResource>(),
        ...props
      },
      global: {
        plugins: [...defaultPlugins(), store]
      }
    })
  }
}

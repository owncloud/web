import {
  createStore,
  defaultPlugins,
  defaultStoreMockOptions,
  shallowMount
} from 'web-test-helpers'
import EmbedActions from 'web-app-files/src/components/EmbedActions/EmbedActions.vue'

jest.mock('@ownclouders/web-pkg', () => ({
  ...jest.requireActual('@ownclouders/web-pkg'),
  createQuicklink: jest.fn().mockImplementation(({ resource, password }) => ({
    url: (password ? password + '-' : '') + 'link-' + resource.id
  })),
  showQuickLinkPasswordModal: jest.fn().mockImplementation((_options, cb) => cb('password'))
}))

const selectors = Object.freeze({
  btnSelect: '[data-testid="button-select"]',
  btnCancel: '[data-testid="button-cancel"]',
  btnShare: '[data-testid="button-share"]'
})

describe('EmbedActions', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('select action', () => {
    it('should disable select action when no resources are selected', () => {
      const { wrapper } = getWrapper()

      expect(wrapper.find(selectors.btnSelect).attributes()).toHaveProperty('disabled')
    })

    it('should enable select action when at least one resource is selected', () => {
      const { wrapper } = getWrapper({ selectedFiles: [{ id: 1 }] })

      expect(wrapper.find(selectors.btnSelect).attributes()).not.toHaveProperty('disabled')
    })

    it('should emit select event when the select action is triggered', async () => {
      window.parent.dispatchEvent = jest.fn()
      global.CustomEvent = jest.fn().mockImplementation(mockCustomEvent)

      const { wrapper } = getWrapper({ selectedFiles: [{ id: 1 }] })

      await wrapper.find(selectors.btnSelect).trigger('click')

      expect(window.parent.dispatchEvent).toHaveBeenCalledWith({
        name: 'owncloud-embed:select',
        payload: { detail: [{ id: 1 }] }
      })
    })
  })

  describe('cancel action', () => {
    it('should emit cancel event when the cancel action is triggered', async () => {
      window.parent.dispatchEvent = jest.fn()
      global.CustomEvent = jest.fn().mockImplementation(mockCustomEvent)

      const { wrapper } = getWrapper({ selectedFiles: [{ id: 1 }] })

      await wrapper.find(selectors.btnCancel).trigger('click')

      expect(window.parent.dispatchEvent).toHaveBeenCalledWith({
        name: 'owncloud-embed:cancel',
        payload: undefined
      })
    })
  })

  describe('share action', () => {
    it('should disable share action when link creation is disabled', () => {
      const { wrapper } = getWrapper({ selectedFiles: [{ id: 1 }] })

      expect(wrapper.find(selectors.btnShare).attributes()).toHaveProperty('disabled')
    })

    it('should disable share action when no resources are selected', () => {
      const { wrapper } = getWrapper()

      expect(wrapper.find(selectors.btnShare).attributes()).toHaveProperty('disabled')
    })

    it('should enable share action when at least one resource is selected and link creation is enabled', () => {
      const { wrapper } = getWrapper({
        selectedFiles: [{ id: 1 }],
        abilities: [{ action: 'create-all', subject: 'PublicLink' }]
      })

      expect(wrapper.find(selectors.btnShare).attributes()).not.toHaveProperty('disabled')
    })

    it('should emit share event when share action is triggered', async () => {
      window.parent.dispatchEvent = jest.fn()
      global.CustomEvent = jest.fn().mockImplementation(mockCustomEvent)

      const { wrapper } = getWrapper({
        selectedFiles: [{ id: 1 }],
        abilities: [{ action: 'create-all', subject: 'PublicLink' }]
      })

      await wrapper.find(selectors.btnShare).trigger('click')

      expect(window.parent.dispatchEvent).toHaveBeenCalledWith({
        name: 'owncloud-embed:share',
        payload: { detail: ['link-1'] }
      })
    })

    it('should ask for password first when required when share action is triggered', async () => {
      window.parent.dispatchEvent = jest.fn()
      global.CustomEvent = jest.fn().mockImplementation(mockCustomEvent)

      const { wrapper } = getWrapper({
        selectedFiles: [{ id: 1 }],
        abilities: [{ action: 'create-all', subject: 'PublicLink' }],
        capabilities: jest.fn().mockReturnValue({
          files_sharing: { public: { password: { enforced_for: { read_only: true } } } }
        })
      })

      await wrapper.find(selectors.btnShare).trigger('click')

      expect(window.parent.dispatchEvent).toHaveBeenCalledWith({
        name: 'owncloud-embed:share',
        payload: { detail: ['password-link-1'] }
      })
    })
  })
})

function getWrapper(
  { selectedFiles = [], abilities = [], capabilities = jest.fn().mockReturnValue({}) } = {
    selectedFiles: [],
    abilities: [],
    capabilities: jest.fn().mockReturnValue({})
  }
) {
  const storeOptions = {
    ...defaultStoreMockOptions,
    getters: { ...defaultStoreMockOptions.getters, capabilities },
    modules: {
      ...defaultStoreMockOptions.modules,
      Files: {
        ...defaultStoreMockOptions.modules.Files,
        getters: {
          ...defaultStoreMockOptions.modules.Files.getters,
          selectedFiles: jest.fn().mockReturnValue(selectedFiles)
        }
      }
    }
  }

  return {
    wrapper: shallowMount(EmbedActions, {
      global: {
        stubs: { OcButton: false },
        plugins: [...defaultPlugins({ abilities }), createStore(storeOptions)]
      }
    })
  }
}

function mockCustomEvent(name, payload) {
  return { name, payload }
}

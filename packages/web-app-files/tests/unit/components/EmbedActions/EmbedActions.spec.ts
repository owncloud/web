import {
  createStore,
  defaultPlugins,
  defaultStoreMockOptions,
  shallowMount
} from 'web-test-helpers'
import EmbedActions from 'web-app-files/src/components/EmbedActions/EmbedActions.vue'
import { getDefaultLinkPermissions } from '@ownclouders/web-pkg'
import { SharePermissionBit } from '@ownclouders/web-client/src/helpers'

jest.mock('@ownclouders/web-pkg', () => ({
  ...jest.requireActual('@ownclouders/web-pkg'),
  createQuicklink: jest.fn().mockImplementation(({ resource, password }) => ({
    url: (password ? password + '-' : '') + 'link-' + resource.id
  })),
  showQuickLinkPasswordModal: jest.fn().mockImplementation((_options, cb) => cb('password')),
  getDefaultLinkPermissions: jest.fn()
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
      window.parent.postMessage = jest.fn()
      global.CustomEvent = jest.fn().mockImplementation(mockCustomEvent)

      const { wrapper } = getWrapper({ selectedFiles: [{ id: 1 }] })

      await wrapper.find(selectors.btnSelect).trigger('click')

      expect(window.parent.postMessage).toHaveBeenCalledWith(
        {
          name: 'owncloud-embed:select',
          data: [{ id: 1 }]
        },
        {}
      )
    })

    it('should enable select action when embedTarget is set to location', () => {
      const { wrapper } = getWrapper({
        configuration: { options: { embed: { target: 'location' } } }
      })

      expect(wrapper.find(selectors.btnSelect).attributes()).not.toHaveProperty('disabled')
    })

    it('should emit select event with currentFolder as selected resource when select action is triggered', async () => {
      window.parent.postMessage = jest.fn()
      global.CustomEvent = jest.fn().mockImplementation(mockCustomEvent)

      const { wrapper } = getWrapper({
        currentFolder: { id: 1 },
        configuration: { options: { embed: { target: 'location' } } }
      })

      await wrapper.find(selectors.btnSelect).trigger('click')

      expect(window.parent.postMessage).toHaveBeenCalledWith(
        {
          name: 'owncloud-embed:select',
          data: [{ id: 1 }]
        },
        {}
      )
    })

    it('should specify the targetOrigin when it is set in the config', async () => {
      window.parent.postMessage = jest.fn()
      global.CustomEvent = jest.fn().mockImplementation(mockCustomEvent)

      const { wrapper } = getWrapper({
        selectedFiles: [{ id: 1 }],
        configuration: { options: { embed: { messagesOrigin: 'https://example.org' } } }
      })

      await wrapper.find(selectors.btnSelect).trigger('click')

      expect(window.parent.postMessage).toHaveBeenCalledWith(
        {
          name: 'owncloud-embed:select',
          data: [{ id: 1 }]
        },
        { targetOrigin: 'https://example.org' }
      )
    })
  })

  describe('cancel action', () => {
    it('should emit cancel event when the cancel action is triggered', async () => {
      window.parent.postMessage = jest.fn()
      global.CustomEvent = jest.fn().mockImplementation(mockCustomEvent)

      const { wrapper } = getWrapper({ selectedFiles: [{ id: 1 }] })

      await wrapper.find(selectors.btnCancel).trigger('click')

      expect(window.parent.postMessage).toHaveBeenCalledWith(
        {
          name: 'owncloud-embed:cancel',
          data: null
        },
        {}
      )
    })

    it('should specify the targetOrigin when it is set in the config', async () => {
      window.parent.postMessage = jest.fn()
      global.CustomEvent = jest.fn().mockImplementation(mockCustomEvent)

      const { wrapper } = getWrapper({
        selectedFiles: [{ id: 1 }],
        configuration: { options: { embed: { messagesOrigin: 'https://example.org' } } }
      })

      await wrapper.find(selectors.btnCancel).trigger('click')

      expect(window.parent.postMessage).toHaveBeenCalledWith(
        {
          name: 'owncloud-embed:cancel',
          data: null
        },
        { targetOrigin: 'https://example.org' }
      )
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
      window.parent.postMessage = jest.fn()
      global.CustomEvent = jest.fn().mockImplementation(mockCustomEvent)

      const { wrapper } = getWrapper({
        selectedFiles: [{ id: 1 }],
        abilities: [{ action: 'create-all', subject: 'PublicLink' }]
      })

      await wrapper.find(selectors.btnShare).trigger('click')

      expect(window.parent.postMessage).toHaveBeenCalledWith(
        {
          name: 'owncloud-embed:share',
          data: ['link-1']
        },
        {}
      )
    })

    it('should ask for password first when required when share action is triggered', async () => {
      window.parent.postMessage = jest.fn()
      global.CustomEvent = jest.fn().mockImplementation(mockCustomEvent)

      const { wrapper } = getWrapper({
        selectedFiles: [{ id: 1 }],
        abilities: [{ action: 'create-all', subject: 'PublicLink' }],
        defaultLinkPermissions: SharePermissionBit.Read,
        capabilities: jest.fn().mockReturnValue({
          files_sharing: { public: { password: { enforced_for: { read_only: true } } } }
        })
      })

      await wrapper.find(selectors.btnShare).trigger('click')

      expect(window.parent.postMessage).toHaveBeenCalledWith(
        {
          name: 'owncloud-embed:share',
          data: ['password-link-1']
        },
        {}
      )
    })

    it('should hide share action when embedTarget is set to location', () => {
      const { wrapper } = getWrapper({
        configuration: { options: { embed: { target: 'location' } } }
      })

      expect(wrapper.find(selectors.btnShare).exists()).toBe(false)
    })

    it('should specify the targetOrigin when it is set in the config', async () => {
      window.parent.postMessage = jest.fn()
      global.CustomEvent = jest.fn().mockImplementation(mockCustomEvent)

      const { wrapper } = getWrapper({
        selectedFiles: [{ id: 1 }],
        configuration: { options: { embed: { messagesOrigin: 'https://example.org' } } },
        abilities: [{ action: 'create-all', subject: 'PublicLink' }]
      })

      await wrapper.find(selectors.btnShare).trigger('click')

      expect(window.parent.postMessage).toHaveBeenCalledWith(
        {
          name: 'owncloud-embed:share',
          data: ['link-1']
        },
        { targetOrigin: 'https://example.org' }
      )
    })
  })
})

function getWrapper(
  {
    selectedFiles = [],
    abilities = [],
    capabilities = jest.fn().mockReturnValue({}),
    configuration = { options: {} },
    currentFolder = {},
    defaultLinkPermissions = SharePermissionBit.Internal
  } = {
    selectedFiles: [],
    abilities: [],
    capabilities: jest.fn().mockReturnValue({})
  }
) {
  jest.mocked(getDefaultLinkPermissions).mockReturnValue(defaultLinkPermissions)
  const storeOptions = {
    ...defaultStoreMockOptions,
    getters: {
      ...defaultStoreMockOptions.getters,
      capabilities,
      configuration: jest.fn().mockReturnValue(configuration || { options: {} })
    },
    modules: {
      ...defaultStoreMockOptions.modules,
      Files: {
        ...defaultStoreMockOptions.modules.Files,
        getters: {
          ...defaultStoreMockOptions.modules.Files.getters,
          selectedFiles: jest.fn().mockReturnValue(selectedFiles),
          currentFolder: jest.fn().mockReturnValue(currentFolder)
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

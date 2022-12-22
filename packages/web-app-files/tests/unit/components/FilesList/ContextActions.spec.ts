import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  defaultStoreMockOptions,
  defaultStubs,
  mount
} from 'web-test-helpers'
import { mockDeep } from 'jest-mock-extended'
import { Resource, SpaceResource } from 'web-client/src/helpers'
import ContextActions from 'web-app-files/src/components/FilesList/ContextActions.vue'

const mixins = [
  '$_acceptShare_items',
  '$_downloadArchive_items',
  '$_move_items',
  '$_copy_items',
  '$_emptyTrashBin_items',
  '$_fileActions_editorActions',
  '$_showShares_items',
  '$_createQuicklink_items',
  '$_downloadArchive_items',
  '$_downloadFile_items',
  '$_delete_items',
  '$_move_items',
  '$_copy_items',
  '$_paste_items',
  '$_rename_items',
  '$_restore_items',
  '$_declineShare_items',
  '$_setSpaceImage_items',
  '$_setSpaceReadme_items',
  '$_navigate_space_items',
  '$_navigate_items',
  '$_favorite_items',
  '$_showDetails_items',
  '$_showEditTags_items'
]

const Component = {
  ...ContextActions,
  mixins
}

describe('ContextActions', () => {
  describe('menu sections', () => {
    it('do not render when no action enabled', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.findAll('action-menu-item-stub').length).toBe(0)
    })

    it('render enabled actions', () => {
      const enabledActions = [
        '$_acceptShare_items',
        '$_createQuicklink_items',
        '$_rename_items',
        '$_fileActions_editorActions'
      ]
      const { wrapper } = getWrapper({ enabledActions })
      expect(wrapper.findAll('action-menu-item-stub').length).toBe(enabledActions.length)
    })
  })
})

function getWrapper({ enabledActions = [] } = {}) {
  const storeOptions = { ...defaultStoreMockOptions }
  storeOptions.modules.Files.getters.currentFolder.mockImplementation(() => '/')
  const store = createStore(storeOptions)
  const mocks = {
    ...defaultComponentMocks(),
    ...getMixinMocks(enabledActions)
  }
  return {
    storeOptions,
    mocks,
    wrapper: mount(Component, {
      props: {
        space: mockDeep<SpaceResource>(),
        items: [mockDeep<Resource>()]
      },
      global: {
        mocks,
        provide: { currentSpace: mockDeep<SpaceResource>() },
        stubs: { ...defaultStubs, 'action-menu-item': true },
        plugins: [...defaultPlugins(), store]
      }
    })
  }
}

const getMixinMocks = (enabledActions) => {
  const mixinMocks = {
    $_fileActions_loadExternalAppActions: jest.fn(() => [
      { isEnabled: () => false, name: '', items: [] }
    ])
  }
  for (const mixin of mixins) {
    const isEnabled = !!enabledActions.includes(mixin)
    mixinMocks[mixin] = [{ isEnabled: () => isEnabled, name: '', items: [] }]
  }
  return mixinMocks
}

import CustomComponentTarget from '../../../src/components/CustomComponentTarget.vue'
import {
  defaultComponentMocks,
  defaultPlugins,
  mount,
  useExtensionPreferencesStoreMock,
  useExtensionRegistryMock
} from 'web-test-helpers'
import {
  CustomComponentExtension,
  Extension,
  ExtensionPoint,
  ExtensionPreferenceItem,
  useExtensionPreferencesStore,
  useExtensionRegistry
} from '../../../src'
import { mock } from 'vitest-mock-extended'
import { h } from 'vue'

vi.mock('../../../src/composables', async (importOriginal) => ({
  ...(await importOriginal<any>()),
  useExtensionRegistry: vi.fn(),
  useExtensionPreferencesStore: vi.fn()
}))

const selectors = {
  target: '[data-testid="custom-component-target"]'
}

describe('CustomComponentTarget', () => {
  const mockExtensionPointSingle = mock<ExtensionPoint>({
    id: 'dummy-extension-point-single',
    type: 'customComponent',
    multiple: false
  })
  const mockExtensionPointMulti = mock<ExtensionPoint>({
    id: 'dummy-extension-point-multi',
    type: 'customComponent',
    multiple: true
  })

  describe('no extensions match the extension point', () => {
    it.each([mockExtensionPointSingle, mockExtensionPointMulti])(
      'renders nothing',
      (extensionPoint) => {
        const { wrapper } = getWrapper({
          extensionPoint,
          extensions: []
        })
        expect(wrapper.find(selectors.target).exists()).toBeFalsy()
      }
    )
  })

  describe('exactly 1 extension matches the extension point', () => {
    it.each([mockExtensionPointSingle, mockExtensionPointMulti])(
      'renders 1 component',
      (extensionPoint) => {
        const extensionId = 'custom-1'
        const { wrapper } = getWrapper({
          extensionPoint,
          extensions: [createExtensionMock(extensionId, extensionPoint.id)]
        })
        expect(wrapper.find(selectors.target).exists()).toBeTruthy()
      }
    )
  })

  describe('multiple extensions match the extension point', () => {
    describe('extension point allows only 1 extension', () => {
      it('renders 1 component, respecting the user preference', () => {
        const extensionMocks = ['custom-1', 'custom-2'].map((id) =>
          createExtensionMock(id, mockExtensionPointSingle.id)
        )
        const { wrapper } = getWrapper({
          extensionPoint: mockExtensionPointSingle,
          extensions: extensionMocks,
          preference: mock<ExtensionPreferenceItem>({
            extensionPointId: mockExtensionPointSingle.id,
            selectedExtensionIds: [extensionMocks[1].id]
          })
        })
        expect(wrapper.findAll(selectors.target).length).toBe(1)
      })
    })

    describe('multiple extensions match the extension point', () => {
      it('renders n components', () => {
        const extensionMocks = ['custom-1', 'custom-2'].map((id) =>
          createExtensionMock(id, mockExtensionPointMulti.id)
        )
        const { wrapper } = getWrapper({
          extensionPoint: mockExtensionPointMulti,
          extensions: extensionMocks
        })
        expect(wrapper.findAll(selectors.target).length).toBe(extensionMocks.length)
      })
    })
  })
})

function getWrapper({
  extensionPoint,
  extensions,
  preference
}: {
  extensionPoint: ExtensionPoint
  extensions: Extension[]
  preference?: ExtensionPreferenceItem
}) {
  vi.mocked(useExtensionRegistry).mockImplementation(() =>
    useExtensionRegistryMock({
      requestExtensions<ExtensionType>(type: string) {
        return extensions as ExtensionType[]
      }
    })
  )
  vi.mocked(useExtensionPreferencesStore).mockImplementation(() =>
    useExtensionPreferencesStoreMock({
      getExtensionPreference() {
        return preference
      }
    })
  )

  const mocks = defaultComponentMocks()

  return {
    mocks,
    wrapper: mount(CustomComponentTarget, {
      props: {
        extensionPoint
      },
      global: {
        plugins: [...defaultPlugins()],
        mocks,
        provide: mocks,
        stubs: { OcCheckbox: true }
      }
    })
  }
}

function createExtensionMock(id: string, extensionPointId: string) {
  return mock<CustomComponentExtension>({
    id,
    type: 'customComponent',
    extensionPointIds: [extensionPointId],
    content: () => [
      h('p', {
        innerHTML: `hello from ${id}`,
        'data-testid': 'custom-component-target'
      })
    ]
  })
}

import ExtensionPreference from '../../../../src/components/Account/ExtensionPreference.vue'
import {
  defaultComponentMocks,
  defaultPlugins,
  mount,
  useExtensionRegistryMock
} from 'web-test-helpers'
import { Extension, ExtensionPoint, useExtensionRegistry } from '@ownclouders/web-pkg'
import { mock } from 'vitest-mock-extended'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@ownclouders/web-pkg', async (importOriginal) => ({
  ...(await importOriginal<any>()),
  useExtensionRegistry: vi.fn()
}))

describe('ExtensionPreference component', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  afterEach(() => {
    localStorage.clear()
  })

  it('renders a dropdown for an extension point', () => {
    const extensionPoint = mock<ExtensionPoint>({
      id: 'test-extension-point',
      multiple: false
    })
    const { wrapper } = getWrapper({ extensionPoint })
    expect(wrapper.find('.v-select').exists()).toBeTruthy()
  })

  describe('extensionPoint with multiple=false', () => {
    it('renders extensions as dropdown options', () => {
      const extensionPoint = mock<ExtensionPoint>({
        id: 'test-extension-point',
        multiple: false,
        defaultExtensionId: 'foo-1'
      })
      const extensions = [
        mock<Extension>({
          id: 'foo-1',
          userPreference: {
            optionLabel: 'Foo 1'
          }
        }),
        mock<Extension>({
          id: 'foo-2',
          userPreference: {
            optionLabel: 'Foo 2'
          }
        })
      ]
      const { wrapper } = getWrapper({ extensionPoint, extensions })

      console.log(wrapper.html())
    })
    it.todo('renders the default extension first in the options list')
    it.todo('selecting an extension updates the extension preference store')
  })

  describe('extensionPoint with multiple=true', () => {
    it.todo('renders extensions as dropdown options')
    it.todo('selecting extensions updates the extension preference store')
  })
})

function getWrapper({
  extensionPoint,
  extensions = []
}: {
  extensionPoint: ExtensionPoint
  extensions?: Extension[]
}) {
  vi.mocked(useExtensionRegistry).mockImplementation(() =>
    useExtensionRegistryMock({
      requestExtensions<ExtensionType>(type: string) {
        return extensions as ExtensionType[]
      }
    })
  )

  const mocks = {
    ...defaultComponentMocks()
  }

  return {
    mocks,
    wrapper: mount(ExtensionPreference, {
      props: {
        extensionPoint
      },
      global: {
        plugins: [...defaultPlugins()],
        mocks,
        provide: mocks
      }
    })
  }
}

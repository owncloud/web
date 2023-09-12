import { mock } from 'jest-mock-extended'
import { ref } from 'vue'
import { Resource } from 'web-client'
import { FileContext, useAppDefaults } from 'web-pkg/src/composables/appDefaults'
import {
  createStore,
  defaultPlugins,
  mount,
  defaultStoreMockOptions,
  defaultComponentMocks,
  defaultStubs
} from 'web-test-helpers'
import { useAppDefaultsMock } from 'web-test-helpers/src/mocks/useAppDefaultsMock'
import App from '../../src/App.vue'

jest.mock('web-pkg/src/composables/appDefaults')

describe('Text editor app', () => {
  it('shows the editor', async () => {
    const { wrapper } = getWrapper()
    await wrapper.vm.loadFileTask.last
    expect(wrapper.find('oc-textarea-stub').exists()).toBeTruthy()
  })

  describe('preview', () => {
    it.each([
      { fileExtension: 'txt', showPreview: false },
      { fileExtension: 'js', showPreview: false },
      { fileExtension: 'php', showPreview: false },
      { fileExtension: 'json', showPreview: false },
      { fileExtension: 'xml', showPreview: false },
      { fileExtension: 'md', showPreview: true }
    ])('shows only for supported file types', async (data) => {
      const { wrapper } = getWrapper({ fileName: `file.${data.fileExtension}` })
      await wrapper.vm.loadFileTask.last
      expect(wrapper.find('#text-editor-preview').exists()).toBe(data.showPreview)
    })
  })
})

function getWrapper({ fileName = 'someFile.txt' }: { fileName?: string } = {}) {
  jest.mocked(useAppDefaults).mockImplementation(() =>
    useAppDefaultsMock({
      currentFileContext: ref(mock<FileContext>({ path: fileName })),
      getFileInfo: jest.fn().mockImplementation(() => mock<Resource>({ permissions: '' }))
    })
  )
  const defaultMocks = { ...defaultComponentMocks() }
  const storeOptions = { ...defaultStoreMockOptions }
  const store = createStore(storeOptions)
  return {
    mocks: defaultMocks,
    storeOptions,
    wrapper: mount(App, {
      global: {
        plugins: [...defaultPlugins(), store],
        mocks: defaultMocks,
        stubs: defaultStubs
      }
    })
  }
}

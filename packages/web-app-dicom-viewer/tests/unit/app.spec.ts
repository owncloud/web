import App from '../../src/App.vue'
import { nextTick, ref } from 'vue'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  shallowMount,
  defaultStoreMockOptions
} from 'web-test-helpers'
import { useAppDefaultsMock } from 'web-test-helpers/src/mocks/useAppDefaultsMock'
import { FileContext, useAppDefaults } from 'web-pkg/src/composables/appDefaults'
import { mock } from 'jest-mock-extended'

jest.mock('web-pkg/src/composables/appDefaults', () => {
  const { queryItemAsString } = jest.requireActual('web-pkg/src/composables/appDefaults')
  return {
    useAppDefaults: jest.fn(),
    useAppFileHandling: jest.fn(),
    queryItemAsString
  }
})

// defining data
// example from preview app, replace with dcm test data
const activeFiles = [
  {
    id: '1',
    name: 'bear.png',
    mimeType: 'image/png',
    path: 'personal/admin/bear.png'
  }
]

// examples for test functions from preview app
/*
describe('Preview app', () => {
  describe('Method "preloadImages"', () => {
    it('should preload images if active file changes', async () => {
      const { wrapper } = createShallowMountWrapper()
      await nextTick()

      wrapper.vm.toPreloadImageIds = []
      wrapper.vm.setActiveFile('personal/admin/sleeping_dog.gif')

      await nextTick()

      expect(wrapper.vm.toPreloadImageIds).toEqual(['8', '9', '1', '6', '4'])
    })
  })
})

const storeOptions = defaultStoreMockOptions
storeOptions.modules.Files.getters.activeFiles.mockImplementation(() => ['3'])
const store = createStore(storeOptions)

function createShallowMountWrapper() {
  jest.mocked(useAppDefaults).mockImplementation(() =>
    useAppDefaultsMock({
      currentFileContext: ref(
        mock<FileContext>({
          path: 'personal/admin/bear.png',
          space: {
            getDriveAliasAndItem: jest.fn().mockImplementation((file) => {
              return activeFiles.find((filteredFile) => filteredFile.id == file.id)?.path
            })
          }
        })
      ),
      activeFiles: ref(activeFiles)
    })
  )

  const mocks = defaultComponentMocks()
  mocks.$previewService.loadPreview.mockResolvedValue('')
  return {
    wrapper: shallowMount(App, {
      data: function () {
        return {
          preloadImageCount: 3
        }
      },
      global: {
        plugins: [...defaultPlugins(), store],
        mocks,
        provide: mocks
      }
    })
  }
}
*/

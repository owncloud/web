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
import {
  FileContext,
  useAppDefaults,
  createLocationShares,
  createLocationCommon,
  createLocationSpaces
} from '@ownclouders/web-pkg'
import { mock } from 'jest-mock-extended'

jest.mock('@ownclouders/web-pkg', () => {
  const { queryItemAsString } = jest.requireActual('@ownclouders/web-pkg')
  return {
    ...jest.requireActual('@ownclouders/web-pkg'),
    useAppDefaults: jest.fn(),
    useAppFileHandling: jest.fn(),
    queryItemAsString
  }
})

const activeFiles = [
  {
    id: '1',
    name: 'bear.png',
    mimeType: 'image/png',
    path: 'personal/admin/bear.png'
  },
  {
    id: '2',
    name: 'elephant.png',
    mimeType: 'image/png',
    path: 'personal/admin/elephant.png'
  },
  {
    id: '3',
    name: 'wale_sounds.flac',
    mimeType: 'audio/flac',
    path: 'personal/admin/wale_sounds.flac'
  },
  {
    id: '4',
    name: 'lonely_sloth_very_sad.gif',
    mimeType: 'image/gif',
    path: 'personal/admin/lonely_sloth_very_sad.gif'
  },
  {
    id: '5',
    name: 'tiger_eats_plants.mp4',
    mimeType: 'video/mp4',
    path: 'personal/admin/tiger_eats_plants.mp4'
  },
  {
    id: '6',
    name: 'happy_hippo.gif',
    mimeType: 'image/gif',
    path: 'personal/admin/happy_hippo.gif'
  },
  {
    id: '7',
    name: 'sleeping_dog.gif',
    mimeType: 'image/gif',
    path: 'personal/admin/sleeping_dog.gif'
  },
  {
    id: '8',
    name: 'cat_murr_murr.gif',
    mimeType: 'image/gif',
    path: 'personal/admin/cat_murr_murr.gif'
  },
  {
    id: '9',
    name: 'labrador.gif',
    mimeType: 'image/gif',
    path: 'personal/admin/labrador.gif'
  }
]

describe('Preview app', () => {
  it.each([
    [createLocationShares('files-shares-via-link').name.toString(), 1],
    [createLocationShares('files-shares-with-others').name.toString(), 1],
    [createLocationCommon('files-common-search').name.toString(), 1],
    [createLocationCommon('files-common-favorites').name.toString(), 1],
    [createLocationSpaces('files-spaces-projects').name.toString(), activeFiles.length],
    ['', activeFiles.length]
  ])(
    'restrict available files based on the currentFileContext routeName("%s")',
    async (routeName, total) => {
      const { wrapper } = createShallowMountWrapper({ routeName })
      await nextTick()

      expect(wrapper.vm.filteredFiles.length).toEqual(total)
    }
  )

  describe('Method "preloadImages"', () => {
    it('should preload images if active file changes', async () => {
      const { wrapper } = createShallowMountWrapper({ routeName: '' })
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

function createShallowMountWrapper(props: { routeName: string }) {
  jest.mocked(useAppDefaults).mockImplementation(() =>
    useAppDefaultsMock({
      currentFileContext: ref(
        mock<FileContext>({
          path: 'personal/admin/bear.png',
          routeName: props.routeName,
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

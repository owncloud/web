import App from '../../src/App.vue'
import { nextTick } from 'vue'
import { defaultComponentMocks, defaultPlugins, shallowMount } from 'web-test-helpers'
import { FileContext } from '@ownclouders/web-pkg'
import { mock } from 'vitest-mock-extended'

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
  describe('Method "preloadImages"', () => {
    it('should preload images if active file changes', async () => {
      const { wrapper } = createShallowMountWrapper()
      await nextTick()

      wrapper.vm.toPreloadImageIds = []
      wrapper.vm.preloadImageCount = 3
      wrapper.vm.setActiveFile('personal/admin/sleeping_dog.gif')

      await nextTick()

      expect(wrapper.vm.toPreloadImageIds).toEqual(['8', '9', '1', '6', '4'])
    })
  })
})

function createShallowMountWrapper() {
  const mocks = defaultComponentMocks()
  mocks.$previewService.loadPreview.mockResolvedValue('')
  return {
    wrapper: shallowMount(App, {
      props: {
        currentFileContext: mock<FileContext>({
          path: 'personal/admin/bear.png',
          space: {
            getDriveAliasAndItem: vi.fn().mockImplementation((file) => {
              return activeFiles.find((filteredFile) => filteredFile.id == file.id)?.path
            })
          }
        }),
        activeFiles,
        isFolderLoading: true,
        revokeUrl: vi.fn(),
        getUrlForResource: vi.fn(),
        loadFolderForFileContext: vi.fn()
      },
      global: {
        plugins: [...defaultPlugins()],
        mocks,
        provide: mocks
      }
    })
  }
}

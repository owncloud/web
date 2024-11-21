import App from '../../src/App.vue'
import { nextTick } from 'vue'
import { defaultComponentMocks, defaultPlugins, shallowMount } from '@ownclouders/web-test-helpers'
import { FileContext } from '@ownclouders/web-pkg'
import { mock } from 'vitest-mock-extended'

const activeFiles = [
  {
    id: '1',
    name: 'bear.png',
    mimeType: 'image/png',
    path: 'personal/admin/bear.png',
    canDownload: () => true
  },
  {
    id: '2',
    name: 'elephant.png',
    mimeType: 'image/png',
    path: 'personal/admin/elephant.png',
    canDownload: () => true
  },
  {
    id: '3',
    name: 'wale_sounds.flac',
    mimeType: 'audio/flac',
    path: 'personal/admin/wale_sounds.flac',
    canDownload: () => true
  },
  {
    id: '4',
    name: 'lonely_sloth_very_sad.gif',
    mimeType: 'image/gif',
    path: 'personal/admin/lonely_sloth_very_sad.gif',
    canDownload: () => true
  },
  {
    id: '5',
    name: 'tiger_eats_plants.mp4',
    mimeType: 'video/mp4',
    path: 'personal/admin/tiger_eats_plants.mp4',
    canDownload: () => true
  },
  {
    id: '6',
    name: 'happy_hippo.gif',
    mimeType: 'image/gif',
    path: 'personal/admin/happy_hippo.gif',
    canDownload: () => true
  },
  {
    id: '7',
    name: 'sleeping_dog.gif',
    mimeType: 'image/gif',
    path: 'personal/admin/sleeping_dog.gif',
    canDownload: () => true
  },
  {
    id: '8',
    name: 'cat_murr_murr.gif',
    mimeType: 'image/gif',
    path: 'personal/admin/cat_murr_murr.gif',
    canDownload: () => true
  },
  {
    id: '9',
    name: 'labrador.gif',
    mimeType: 'image/gif',
    path: 'personal/admin/labrador.gif',
    canDownload: () => true
  }
]

describe('Preview app', () => {
  describe('Method "preloadImages"', () => {
    it('should preload images if active file changes', async () => {
      const { wrapper } = createShallowMountWrapper()
      await nextTick()

      wrapper.vm.cachedFiles = {}
      wrapper.vm.setActiveFile('personal/admin/sleeping_dog.gif')

      await nextTick()

      expect(
        Object.values(wrapper.vm.cachedFiles)
          .filter((cachedFile) => cachedFile.isImage)
          .map((cachedFile) => cachedFile.id)
          .sort((a, b) => a.localeCompare(b))
      ).toEqual(['1', '2', '4', '6', '7', '8', '9'])
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

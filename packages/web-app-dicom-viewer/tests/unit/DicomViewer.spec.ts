import DicomViewer from '../../src/DicomViewer.vue'
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

// -------------------------------------------------
// suggested test cases
// - is Cornerstone core initalized on "beforeUpdate"
// - is RenderEngine enabled (on "beforeUpdate")
// - is div element with id="dicom-canvas" visible (on "beforeUpdate")
// - does canvas element with class="cornerstone-canvas" exist? (on "beforeUpdate")
// - test addWadouriPrefix() function
// - when a dcm file (mock or real file? --> upload local file) is set on stack, does the viewport then contain the corresponding data (by getting the content of the file as datastring)?
// - when a dcm file is set on stack, does the viewport then contain the corresponding meta data?
// - test if the correct sop class is displayed
// - test prefetching meta data (function not yet fully implemented)
//
// -------------------------------------------------
// more test cases for controls (implementation work in progress, in separate branch)
// - do the controls exist (rotate, zoom, flip, invert, reset)
// - test if the functionality of these controls is working properly (check the value of a certain pixel?)
// - test if image manipulation is possible through mouse interaction (not yet implemented)
// -------------------------------------------------

// -------------------------------------------------
// implementation of test cases
// -------------------------------------------------

// defining data
// example from preview app, so far not used in any test case

const dicomFiles = [
  {
    id: '1',
    name: 'MRBRAIN.dcm',
    mimeType: 'application/dicom',
    path: 'personal/admin/MRBRAIN.dcm'
  }
]

const dicomTestFilePath = './testfiles/MRBRAIN.dcm' // check if this needs to be an import or a const
const dicomURL = 'https://dav/spaces/path/to/file.dcm?OC-Credential=xyz'
const wadouriDicomURL = 'wadouri:https://dav/spaces/path/to/file.dcm?OC-Credential=xyz'

// test cases
describe('Dicom viewer app for testing only', () => {
  describe('dummy test', () => {
    it('do nothing', () => {
      console.log(dicomTestFilePath)
      expect(dicomTestFilePath).toBe(dicomTestFilePath)
    })
  })
})
/*
describe('Dicom viewer app', () => {
  describe('Method "addWadouriPrefix"', () => {
    it('should add wadouri prefix to dicom file path', async () => {
      const newURL = DicomViewer.addWadouriPrefix(dicomURL)
      expect(DicomViewer.addWadouriPrefix(dicomURL)).toBe(wadouriDicomURL)
    })
  })
})
*/

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
          path: 'personal/admin/MRBRAIN.dcm',
          space: {
            getDriveAliasAndItem: jest.fn().mockImplementation((file) => {
              return dicomFiles.find((filteredFile) => filteredFile.id == file.id)?.path
            })
          }
        })
      ),
      activeFiles: ref(dicomFiles)
    })
  )

  const mocks = defaultComponentMocks()
  mocks.$previewService.loadPreview.mockResolvedValue('')
  return {
    wrapper: shallowMount(DicomViewer, {
      data: function () {
        return {}
      },
      global: {
        plugins: [
          ...defaultPlugins()
          //store
        ],
        mocks,
        provide: mocks
      }
    })
  }
}
*/

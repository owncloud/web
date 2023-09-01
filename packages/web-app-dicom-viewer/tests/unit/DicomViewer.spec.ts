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
const dicomFiles = [
  {
    id: '1',
    name: 'MRBRAIN.dcm',
    mimeType: 'application/dicom',
    path: 'personal/admin/MRBRAIN.dcm'
  }
] // so far not used in any test case

const dicomTestFilePath = './testfiles/MRBRAIN.dcm' // check if this needs to be an import or a const

// test cases
// dummy test case
describe('Dicom viewer app', () => {
  describe('dummy test', () => {
    it('do nothing :)', () => {
      expect(dicomTestFilePath).toBe(dicomTestFilePath)
    })
  })
})

// test addWadouriPrefix() method
describe('Dicom viewer app', () => {
  describe('Method "addWadouriPrefix"', () => {
    it('should add wadouri prefix to dicom file path', async () => {
      const dicomURL = 'https://dav/spaces/path/to/file.dcm?OC-Credential=xyz'
      const wadouriDicomURL = 'wadouri:https://dav/spaces/path/to/file.dcm?OC-Credential=xyz'
      const modifiedURL = await DicomViewer.methods.addWadouriPrefix(dicomURL)
      expect(modifiedURL).toEqual(wadouriDicomURL)
    })
  })
})

import { createLocalVue, shallowMount } from '@vue/test-utils'
import UploadInfo from '../../../src/components/UploadInfo'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import GetTextPlugin from 'vue-gettext'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(DesignSystem)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

describe('UploadInfo component', () => {
  it('should render the component in a hidden state per default', () => {
    const wrapper = getShallowWrapper()
    const overlay = wrapper.find('#upload-info')
    expect(overlay.exists()).toBeFalsy()
  })
  it('should show the component', () => {
    const wrapper = getShallowWrapper({ showInfo: true })
    const overlay = wrapper.find('#upload-info')
    expect(overlay.exists()).toBeTruthy()
  })
  describe('title', () => {
    it('should show that an upload is in progress', () => {
      const wrapper = getShallowWrapper({
        showInfo: true,
        filesInProgressCount: 1,
        runningUploads: 1
      })
      const uploadTitle = wrapper.find('.upload-info-title p').text()
      expect(uploadTitle).toBe('1 item uploading...')
    })
    it('should show that an upload was successful', () => {
      const wrapper = getShallowWrapper({
        showInfo: true,
        filesInProgressCount: 0,
        runningUploads: 0,
        successful: [{ name: 'file', type: 'file' }],
        errors: []
      })
      const uploadTitle = wrapper.find('.upload-info-title p').text()
      expect(uploadTitle).toBe('Upload complete')
    })
    it('should show that an upload failed', () => {
      const wrapper = getShallowWrapper({
        showInfo: true,
        filesInProgressCount: 0,
        runningUploads: 0,
        errors: [{ name: 'file', type: 'file' }],
        successful: []
      })
      const uploadTitle = wrapper.find('.upload-info-title p').text()
      expect(uploadTitle).toBe('Upload failed')
    })
    it('should show that an upload was cancelled', () => {
      const wrapper = getShallowWrapper({
        showInfo: true,
        filesInProgressCount: 0,
        runningUploads: 0,
        errors: [],
        successful: [],
        uploadsCancelled: true
      })
      const uploadTitle = wrapper.find('.upload-info-title p').text()
      expect(uploadTitle).toBe('Upload cancelled')
    })
    it('should show that an upload is preparing', () => {
      const wrapper = getShallowWrapper({
        showInfo: true,
        filesInProgressCount: 0,
        runningUploads: 1,
        inPreparation: true
      })
      const uploadTitle = wrapper.find('.upload-info-title p').text()
      expect(uploadTitle).toBe('Preparing upload...')
    })
  })
  describe('progress bar', () => {
    it('should show the progress bar when an upload is in progress', () => {
      const wrapper = getShallowWrapper({
        showInfo: true,
        filesInProgressCount: 1,
        runningUploads: 1
      })
      const progressBar = wrapper.find('.upload-info-progress')
      expect(progressBar.exists()).toBeTruthy()
    })
  })
  describe('info', () => {
    it('should show the number of successful items', () => {
      const wrapper = getShallowWrapper({
        showInfo: true,
        filesInProgressCount: 0,
        runningUploads: 0,
        errors: [],
        successful: [
          { name: 'file', type: 'file' },
          { name: 'file2', type: 'file' }
        ]
      })
      const info = wrapper.find('.upload-info-success').text()
      expect(info).toBe('2 items uploaded')
    })
    it('should show the number of failed items', () => {
      const wrapper = getShallowWrapper({
        showInfo: true,
        filesInProgressCount: 0,
        runningUploads: 0,
        errors: [{ name: 'file', type: 'file' }],
        successful: [{ name: 'file2', type: 'file2' }]
      })
      const info = wrapper.find('.upload-info-danger').text()
      expect(info).toBe('1 of 2 items failed')
    })
  })
  describe('details', () => {
    it('should hide the info by default', () => {
      const wrapper = getShallowWrapper({
        showInfo: true
      })
      const info = wrapper.find('.upload-info-items')
      expect(info.exists()).toBeFalsy()
    })
    it('should list all the uploaded files when the info is displayed', () => {
      const wrapper = getShallowWrapper({
        showInfo: true,
        infoExpanded: true,
        uploads: [
          { name: 'file', type: 'file' },
          { name: 'file2', type: 'file' }
        ]
      })
      const info = wrapper.find('.upload-info-items')
      expect(info.exists()).toBeTruthy()

      const uploadedItems = wrapper.findAll('.upload-info-items li')
      expect(uploadedItems.length).toBe(2)
    })
    it('folder is clickable', () => {
      const wrapper = getShallowWrapper({
        showInfo: true,
        infoExpanded: true,
        uploads: [{ name: 'file', type: 'folder', isFolder: true, targetRoute: {}, path: '' }]
      })

      const info = wrapper.find('.upload-info-items')
      expect(info.exists()).toBeTruthy()
      const resourceStub = wrapper.find('.upload-info-items li oc-resource-stub')
      expect(resourceStub.props().isResourceClickable).toBeTruthy()
    })
  })
  describe('getRemainingTime method', () => {
    it.each([
      { ms: 1000, expected: 'Few seconds left' },
      { ms: 1000 * 60 * 30, expected: '30 minutes left' },
      { ms: 1000 * 60 * 60, expected: '1 hour left' },
      { ms: 1000 * 60 * 60 * 2, expected: '2 hours left' }
    ])('should return the proper string', ({ ms, expected }) => {
      const wrapper = getShallowWrapper()
      const estimatedTime = wrapper.vm.getRemainingTime(ms)
      expect(estimatedTime).toBe(expected)
    })
  })
})

function createStore() {
  return new Vuex.Store({
    getters: {
      configuration: () => ({
        options: {
          disablePreviews: false
        }
      })
    }
  })
}

function getShallowWrapper({
  showInfo = false,
  infoExpanded = false,
  uploads = [],
  filesInProgressCount = 0,
  runningUploads = 0,
  successful = [],
  errors = [],
  uploadsCancelled = false,
  inPreparation = false
} = {}) {
  return shallowMount(UploadInfo, {
    localVue,
    store: createStore(),
    data() {
      return {
        showInfo,
        infoExpanded,
        uploads,
        filesInProgressCount,
        runningUploads,
        successful,
        errors,
        uploadsCancelled,
        inPreparation
      }
    },
    mocks: {
      $uppyService: {
        subscribe: jest.fn(),
        tusActive: jest.fn()
      }
    }
  })
}

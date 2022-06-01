import { createLocalVue, shallowMount } from '@vue/test-utils'
import UploadInfo from '../../../src/components/UploadInfo'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(DesignSystem)

describe('UploadInfo component', () => {
  it('should render the component in a hidden state per default', () => {
    const wrapper = getShallowWrapper()
    expect(wrapper).toMatchSnapshot()
  })
  it('should show the component', () => {
    const wrapper = getShallowWrapper(true)
    expect(wrapper).toMatchSnapshot()
  })
  it('should show uploaded files without parent folder link', () => {
    const wrapper = getShallowWrapper(true, [{ name: 'file', type: 'file' }])
    expect(wrapper).toMatchSnapshot()
  })
  it('should show uploaded files with parent folder link', () => {
    const wrapper = getShallowWrapper(true, [
      { name: 'file', type: 'file', path: 'path', targetRoute: {} }
    ])
    expect(wrapper).toMatchSnapshot()
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

function getShallowWrapper(showInfo = false, successfulUploads = []) {
  return shallowMount(UploadInfo, {
    localVue,
    store: createStore(),
    data() {
      return {
        showInfo,
        successfulUploads
      }
    },
    mocks: {
      $uppyService: {
        subscribe: jest.fn()
      },
      $gettextInterpolate: jest.fn(),
      $ngettext: jest.fn()
    }
  })
}

import { mount } from '@vue/test-utils'
import FilesDrop from '../../../src/views/FilesDrop.vue'
import { defaultStoreMockOptions } from 'web-test-helpers/src/mocks/store/defaultStoreMockOptions'
import { defaultComponentMocks } from 'web-test-helpers/src/mocks/defaultComponentMocks'
import { createStore } from 'vuex-extensions'
import { defaultLocalVue } from 'web-test-helpers/src/localVue/defaultLocalVue'
import Vuex from 'vuex'
import { defaultStubs } from 'web-test-helpers/src/mocks/defaultStubs'
import {mockDeep} from "jest-mock-extended";
import {OwnCloudSdk} from "web-client/src/types";

describe('FilesDrop view', () => {
  it('drop container always present', () => {
    const { wrapper } = getMountedWrapper()
    expect(wrapper.find('#files-drop-container').exists()).toBeTruthy()
  })
  describe('different files view states', () => {
    it('shows the loading spinner during loading', () => {
      const { wrapper } = getMountedWrapper({ loading: true })
      expect(wrapper.find('oc-spinner-stub').exists()).toBeTruthy()
    })
    it('shows the "resource-upload"-component after loading', () => {
      const { wrapper } = getMountedWrapper()
      expect(wrapper.find('oc-spinner-stub').exists()).toBeFalsy()
      expect(wrapper.find('resource-upload-stub').exists()).toBeTruthy()
    })
  })
})

function getMountedWrapper({ mocks = {}, loading = false } = {}) {
  const defaultMocks = {
    ...defaultComponentMocks({
      currentRoute: { name: 'files-common-favorites' }
    }),
    $client: {
      publicFiles: { list: jest.fn(() => Promise.resolve([ mockDeep<OwnCloudSdk>()])) }
    },
    ...(mocks && mocks)
  }
  const storeOptions = { ...defaultStoreMockOptions }
  const localVue = defaultLocalVue({ compositionApi: true })
  const store = createStore(Vuex.Store, storeOptions)
  return {
    mocks: defaultMocks,
    storeOptions,
    wrapper: mount(FilesDrop, {
      localVue,
      mocks: defaultMocks,
      store,
      stubs: defaultStubs,
      data: () => ({
        loading
      })
    })
  }
}

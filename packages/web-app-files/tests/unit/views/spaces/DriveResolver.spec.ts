import { mount } from '@vue/test-utils'
import DriveResolver from '../../../../src/views/spaces/DriveResolver.vue'
import { defaultStoreMockOptions } from 'web-test-helpers/src/mocks/store/defaultStoreMockOptions'
import { defaultComponentMocks } from 'web-test-helpers/src/mocks/defaultComponentMocks'
import { createStore } from 'vuex-extensions'
import { defaultLocalVue } from 'web-test-helpers/src/localVue/defaultLocalVue'
import Vuex from 'vuex'
import { useDriveResolver } from 'web-pkg/src/composables'
import { spaces } from 'web-app-files/tests/__fixtures__'
import { computed, ref } from '@vue/composition-api'
import { defaultStubs } from 'web-test-helpers/src/mocks/defaultStubs'

jest.mock('web-pkg/src/composables/driveResolver')

describe('DriveResolver view', () => {
  it('renders the "drive-redirect"-component when no space is given', () => {
    const { wrapper } = getMountedWrapper()
    expect(wrapper.find('drive-redirect-stub').exists()).toBeTruthy()
  })
  it('renders the "generic-trash"-component when on a trash route', () => {
    const { wrapper } = getMountedWrapper({
      space: spaces[0],
      currentRouteName: 'files-trash-generic'
    })
    expect(wrapper.find('generic-trash-stub').exists()).toBeTruthy()
  })
  it('renders the "generic-space"-component when a space is given', () => {
    const { wrapper } = getMountedWrapper({ space: spaces[0] })
    expect(wrapper.find('generic-space-stub').exists()).toBeTruthy()
  })
})

function getMountedWrapper({
  mocks = {},
  space = undefined,
  currentRouteName = 'files-spaces-generic'
} = {}) {
  jest.mocked(useDriveResolver).mockImplementation(() => ({
    space,
    item: ref('/'),
    itemId: computed(() => 'id')
  }))
  const defaultMocks = {
    ...defaultComponentMocks({
      currentRoute: { name: currentRouteName, params: { driveAliasAndItem: '/' } }
    }),
    ...(mocks && mocks)
  }
  const storeOptions = { ...defaultStoreMockOptions }
  const localVue = defaultLocalVue({ compositionApi: true })
  const store = createStore(Vuex.Store, storeOptions)
  return {
    mocks: defaultMocks,
    storeOptions,
    wrapper: mount(DriveResolver, {
      localVue,
      mocks: defaultMocks,
      store,
      stubs: defaultStubs
    })
  }
}

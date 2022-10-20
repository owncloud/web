import Vuex from 'vuex'
import { createStore } from 'vuex-extensions'
import { mount } from '@vue/test-utils'
import DeletedFiles from '../../../../src/mixins/spaces/actions/deletedFiles.js'
import { createLocationTrash } from '../../../../src/router'
import { buildSpace, SpaceResource } from 'web-client/src/helpers'
import { defaultComponentMocks } from 'web-test-helpers/src/mocks/defaultComponentMocks'
import { mockDeep } from 'jest-mock-extended'
import { defaultStoreMockOptions } from 'web-test-helpers/src/mocks/store/defaultStoreMockOptions'
import { defaultLocalVue } from 'web-test-helpers/src/localVue/defaultLocalVue'

const Component = {
  template: '<div></div>',
  mixins: [DeletedFiles]
}

describe('delete', () => {
  afterEach(() => jest.clearAllMocks())

  describe('isEnabled property', () => {
    it('should be false when not resource given', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.vm.$_deletedFiles_items[0].isEnabled({ resources: [] })).toBe(false)
    })
    it('should be true when resource is given', () => {
      const spaceMock = {
        id: '1'
      }
      const { wrapper } = getWrapper()
      expect(
        wrapper.vm.$_deletedFiles_items[0].isEnabled({ resources: [buildSpace(spaceMock)] })
      ).toBe(true)
    })
  })

  describe('method "$_deletedFiles_trigger"', () => {
    it('should trigger route change', async () => {
      const driveAliasAndItem = 'project/mars'

      const { mocks, wrapper } = getWrapper()
      mocks.space.getDriveAliasAndItem.mockReturnValueOnce(driveAliasAndItem)
      await wrapper.vm.$_deletedFiles_trigger()

      expect(wrapper.vm.$router.push).toHaveBeenCalledWith(
        createLocationTrash('files-trash-generic', {
          params: {
            driveAliasAndItem
          },
          query: {}
        })
      )
    })
  })
})

function getWrapper() {
  const mocks = {
    ...defaultComponentMocks(),
    space: mockDeep<SpaceResource>()
  }
  const storeOptions = {
    ...defaultStoreMockOptions
  }
  const localVue = defaultLocalVue()
  const store = createStore(Vuex.Store, storeOptions)
  return {
    mocks,
    storeOptions,
    wrapper: mount(Component, {
      localVue,
      mocks,
      store
    })
  }
}

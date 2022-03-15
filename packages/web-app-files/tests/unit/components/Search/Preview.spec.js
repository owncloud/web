import { shallowMount, createLocalVue } from '@vue/test-utils'
import DesignSystem from 'owncloud-design-system'

import Preview from '@files/src/components/Search/Preview.vue'
import VueCompositionAPI from '@vue/composition-api'

const localVue = createLocalVue()
localVue.use(DesignSystem)
localVue.use(VueCompositionAPI)

const selectors = {
  searchPreview: '.files-search-preview'
}

const searchResult = {
  id: 1234,
  data: {
    storageId: 1,
    name: 'lorem.txt',
    path: '/'
  }
}

const spyTriggerDefaultAction = jest
  .spyOn(Preview.mixins[0].methods, '$_fileActions_triggerDefaultAction')
  .mockImplementation()

describe('Preview component', () => {
  it('should set correct props on oc-resource component', () => {
    const wrapper = getWrapper()
    const ocResource = wrapper.find('oc-resource-stub')

    expect(ocResource.exists()).toBeTruthy()
    expect(ocResource.props().resource).toMatchObject(searchResult.data)
  })
  it('should trigger the default action when search preview button is clicked', async () => {
    const wrapper = getWrapper()
    const searchPreview = wrapper.find(selectors.searchPreview)

    expect(spyTriggerDefaultAction).toHaveBeenCalledTimes(0)

    await searchPreview.trigger('click')

    expect(spyTriggerDefaultAction).toHaveBeenCalledTimes(1)
  })
  describe('folder and parent folder link', () => {
    it('should be empty if no resource target location given', () => {
      const wrapper = getWrapper({ resourceTargetLocation: null })
      expect(wrapper.vm.folderLink(searchResult.data)).toEqual({})
      expect(wrapper.vm.parentFolderLink(searchResult.data)).toEqual({})
    })
    it('should use the items storageId for the resource target location if present', () => {
      const wrapper = getWrapper({ resourceTargetLocation: { name: 'some-route' } })
      expect(wrapper.vm.folderLink(searchResult.data).params.storageId).toEqual(1)
      expect(wrapper.vm.parentFolderLink(searchResult.data).params.storageId).toEqual(1)
    })
  })
})

function getWrapper({
  resourceTargetLocation = {},
  route = {
    query: {},
    params: {}
  }
} = {}) {
  return shallowMount(Preview, {
    localVue,
    mocks: {
      $route: route
    },
    propsData: {
      searchResult
    },
    stubs: {
      'oc-progress': true,
      'oc-resource': true
    },
    setup: () => {
      return {
        resourceTargetLocation
      }
    }
  })
}

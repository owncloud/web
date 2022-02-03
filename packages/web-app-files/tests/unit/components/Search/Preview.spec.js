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
    name: 'lorem.txt',
    path: '/'
  }
}

const spyTriggerDefaultAction = jest
  .spyOn(Preview.mixins[0].methods, '$_fileActions_triggerDefaultAction')
  .mockImplementation()

const wrapper = shallowMount(Preview, {
  localVue,
  mocks: {
    $route: {
      query: {},
      params: {}
    }
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
      resourceTargetLocation: {}
    }
  }
})

describe('Preview component', () => {
  it('should set correct props on oc-resource component', () => {
    const ocResource = wrapper.find('oc-resource-stub')

    expect(ocResource.exists()).toBeTruthy()
    expect(ocResource.props().resource).toMatchObject(searchResult.data)
  })
  it('should trigger the default action when search preview button is clicked', async () => {
    const searchPreview = wrapper.find(selectors.searchPreview)

    expect(spyTriggerDefaultAction).toHaveBeenCalledTimes(0)

    await searchPreview.trigger('click')

    expect(spyTriggerDefaultAction).toHaveBeenCalledTimes(1)
  })
})

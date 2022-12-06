import { shallowMount, createLocalVue } from '@vue/test-utils'
import GetTextPlugin from 'vue-gettext'
import Vuex from 'vuex'
import TagsPanel from 'web-app-files/src/components/SideBar/TagsPanel.vue'
import { useRequest } from 'web-pkg/src/composables'
import { defaultComponentMocks } from 'web-test-helpers/src/mocks/defaultComponentMocks'
import { defaultStubs } from 'web-test-helpers/src/mocks/defaultStubs'
import { defaultStoreMockOptions } from 'web-test-helpers/src/mocks/store/defaultStoreMockOptions'

jest.mock('web-pkg/src/composables/authContext')

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const createFile = (input) => {
  return {
    isReceivedShare: () => false,
    getDomSelector: () => input.id,
    ...input // spread input last so that input can overwrite predefined defaults
  }
}
const simpleOwnFolder = createFile({
  id: '1',
  type: 'folder',
  ownerId: 'marie',
  ownerDisplayName: 'Marie',
  mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  tags: ['moon', 'mars'],
  size: '740'
})

describe('Tags Panel', () => {
  it('show tags if loaded successfully', () => {
    const wrapper = createWrapper(simpleOwnFolder)
    expect(wrapper.find('#tags-form').exists()).toBeTruthy()
  })
  it('pass tags to the oc-select component', async () => {
    const tags = ['test', 'tag']
    const wrapper = createWrapper(simpleOwnFolder, tags)
    await wrapper.vm.loadAllTagsTask.last
    expect(wrapper.find('oc-select-stub').attributes().options).toEqual(tags.join(','))
  })
})

function createWrapper(testResource, tags = []) {
  jest.mocked(useRequest).mockImplementation(() => {
    return {
      makeRequest: jest.fn().mockResolvedValue({
        data: {
          tags
        }
      })
    }
  })
  return shallowMount(TagsPanel, {
    store: new Vuex.Store(defaultStoreMockOptions),
    localVue,
    mocks: defaultComponentMocks,
    stubs: defaultStubs,
    provide: {
      displayedItem: testResource
    }
  })
}

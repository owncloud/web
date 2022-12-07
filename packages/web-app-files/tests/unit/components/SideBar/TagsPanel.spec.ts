import { createLocalVue, mount } from '@vue/test-utils'
import GetTextPlugin from 'vue-gettext'
import Vuex from 'vuex'
import TagsPanel from 'web-app-files/src/components/SideBar/TagsPanel.vue'
import { useRequest } from 'web-pkg/src/composables'
import { defaultComponentMocks } from 'web-test-helpers/src/mocks/defaultComponentMocks'
import { defaultStubs } from 'web-test-helpers/src/mocks/defaultStubs'
import { defaultStoreMockOptions } from 'web-test-helpers/src/mocks/store/defaultStoreMockOptions'
import { eventBus } from 'web-pkg'
import { mockDeep } from 'jest-mock-extended'
import { Resource } from 'web-client'
import { OwnCloudSdk } from 'web-client/src/types'

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
  describe('save', () => {
    it('published the save event', async () => {
      const tags = ['test', 'tag']
      const eventStub = jest.spyOn(eventBus, 'publish')
      const wrapper = createWrapper(simpleOwnFolder, tags)
      await wrapper.vm.save()
      expect(eventStub).toHaveBeenCalled()
    })
    it('adds new tags', async () => {
      const addResourceTagStub = jest.fn().mockImplementation().mockResolvedValue(true)
      const clientMock = mockDeep<OwnCloudSdk>({
        tags: { addResourceTag: addResourceTagStub }
      })
      const resource = mockDeep<Resource>({ tags: ['moon'] })
      const allTags = ['moon', 'mars']
      const wrapper = createWrapper(resource, allTags, clientMock)
      resource.tags = []
      await wrapper.vm.save()
      expect(addResourceTagStub).toHaveBeenCalled()
    })
    it('remove existing tags', async () => {
      const removeResourceTagStub = jest.fn().mockImplementation().mockResolvedValue(true)
      const clientMock = mockDeep<OwnCloudSdk>({
        tags: { removeResourceTag: removeResourceTagStub }
      })
      const resource = mockDeep<Resource>({ tags: ['moon'] })
      const allTags = ['moon', 'mars']
      const wrapper = createWrapper(resource, allTags, clientMock)
      resource.tags.push('new tag')
      await wrapper.vm.save()
      expect(removeResourceTagStub).toHaveBeenCalled()
    })
    it('logs error on failure', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const removeResourceTagStub = jest.fn().mockImplementation().mockRejectedValue(false)
      const clientMock = mockDeep<OwnCloudSdk>({
        tags: { removeResourceTag: removeResourceTagStub }
      })
      const eventStub = jest.spyOn(eventBus, 'publish')
      const resource = mockDeep<Resource>({ tags: ['moon'] })
      const allTags = ['moon', 'mars']
      const wrapper = createWrapper(resource, allTags, clientMock)
      resource.tags.push('new tag')
      await wrapper.vm.save()
      expect(eventStub).not.toHaveBeenCalled()
    })
  })
})

function createWrapper(testResource, allTags = [], clientMock = mockDeep<OwnCloudSdk>()) {
  jest.mocked(useRequest).mockImplementation(() => {
    return {
      makeRequest: jest.fn().mockResolvedValue({
        data: {
          tags: allTags
        }
      })
    }
  })
  return mount(TagsPanel, {
    store: new Vuex.Store(defaultStoreMockOptions),
    localVue,
    mocks: { ...defaultComponentMocks(), $client: clientMock },
    stubs: defaultStubs,
    provide: {
      displayedItem: testResource
    }
  })
}

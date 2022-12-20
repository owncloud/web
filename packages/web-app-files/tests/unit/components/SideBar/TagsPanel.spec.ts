import {
  createStore,
  defaultComponentMocks,
  defaultStoreMockOptions,
  defaultStubs,
  mount,
  defaultPlugins
} from 'web-test-helpers'
import TagsPanel from 'web-app-files/src/components/SideBar/TagsPanel.vue'
import { useRequest } from 'web-pkg/src/composables'
import { ClientService, eventBus } from 'web-pkg'
import { mockDeep } from 'jest-mock-extended'
import { Resource } from 'web-client'
import { OwnCloudSdk } from 'web-client/src/types'

jest.mock('web-pkg/src/composables/authContext')

describe('Tags Panel', () => {
  const allTags = ['moon', 'mars', 'sun']
  const resource = mockDeep<Resource>({ tags: ['moon', 'mars'] })
  const clientService = mockDeep<ClientService>()

  it('show tags input form if loaded successfully', () => {
    const { wrapper } = createWrapper(resource)
    expect(wrapper.find('#tags-form').exists()).toBeTruthy()
  })
  it('all available tags are selectable', async () => {
    const { wrapper } = createWrapper(resource, allTags)
    await wrapper.vm.loadAllTagsTask.last
    expect(wrapper.find('oc-select-stub').attributes().options).toEqual(allTags.join(','))
  })
  describe('save method', () => {
    it('publishes the "save"-event', async () => {
      const eventStub = jest.spyOn(eventBus, 'publish')
      const { wrapper } = createWrapper(resource, allTags)
      await wrapper.vm.save()
      expect(eventStub).toHaveBeenCalled()
    })
    it('calls the client to add new tags', async () => {
      const addResourceTagStub = jest.fn().mockImplementation().mockResolvedValue({})
      clientService.owncloudSdk = mockDeep<OwnCloudSdk>({
        tags: { addResourceTag: addResourceTagStub }
      })
      const { wrapper } = createWrapper(resource, allTags, clientService)
      resource.tags = []
      await wrapper.vm.save()
      expect(addResourceTagStub).toHaveBeenCalled()
    })
    it('calls the client to remove existing tags', async () => {
      const removeResourceTagStub = jest.fn().mockImplementation().mockResolvedValue({})
      clientService.owncloudSdk = mockDeep<OwnCloudSdk>({
        tags: { removeResourceTag: removeResourceTagStub }
      })
      const { wrapper } = createWrapper(resource, allTags, clientService)
      resource.tags.push('new tag')
      await wrapper.vm.save()
      expect(removeResourceTagStub).toHaveBeenCalled()
    })
    it('logs error on failure', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const removeResourceTagStub = jest.fn().mockImplementation().mockRejectedValue(new Error())
      clientService.owncloudSdk = mockDeep<OwnCloudSdk>({
        tags: { removeResourceTag: removeResourceTagStub }
      })
      const eventStub = jest.spyOn(eventBus, 'publish')
      const { wrapper } = createWrapper(resource, allTags, clientService)
      resource.tags.push('sun')
      await wrapper.vm.save()
      expect(eventStub).not.toHaveBeenCalled()
    })
  })
})

function createWrapper(testResource, allTags = [], clientService = mockDeep<ClientService>()) {
  jest.mocked(useRequest).mockImplementation(() => ({
    makeRequest: jest.fn().mockResolvedValue({ data: { tags: allTags } })
  }))

  const store = createStore(defaultStoreMockOptions)
  return {
    wrapper: mount(TagsPanel, {
      global: {
        plugins: [...defaultPlugins(), store],
        mocks: { ...defaultComponentMocks(), $clientService: clientService },
        stubs: defaultStubs,
        provide: {
          displayedItem: testResource
        }
      }
    })
  }
}

import {
  createStore,
  defaultComponentMocks,
  defaultStoreMockOptions,
  defaultStubs,
  mount,
  defaultPlugins,
  mockAxiosResolve
} from 'web-test-helpers'
import TagsPanel from 'web-app-files/src/components/SideBar/TagsPanel.vue'
import { mockDeep } from 'jest-mock-extended'
import { Resource } from 'web-client'
import { ClientService, eventBus } from 'web-pkg'

jest.mock('web-pkg/src/composables/authContext')

describe('Tags Panel', () => {
  it('show tags input form if loaded successfully', () => {
    const resource = mockDeep<Resource>()
    const { wrapper } = createWrapper(resource)
    expect(wrapper.find('#tags-form').exists()).toBeTruthy()
  })

  it('all available tags are selectable', async () => {
    const tags = 'a,b,c'
    const resource = mockDeep<Resource>()
    const clientService = mockDeep<ClientService>()
    clientService.graphAuthenticated.tags.getTags.mockResolvedValueOnce(
      mockAxiosResolve({ value: tags.split(',') })
    )

    const { wrapper } = createWrapper(resource, clientService)
    await wrapper.vm.loadAvailableTagsTask.last
    expect(wrapper.find('oc-select-stub').attributes().options).toEqual(tags)
  })

  describe('save method', () => {
    it('publishes the "save"-event', async () => {
      const eventStub = jest.spyOn(eventBus, 'publish')
      const resource = mockDeep<Resource>({ tags: ['a', 'b'] })
      const { wrapper } = createWrapper(resource)
      await wrapper.vm.save()
      expect(eventStub).toHaveBeenCalled()
    })
  })

  test.each<[string[], string[], string[]]>([
    [['a', 'b'], ['c'], ['c']],
    [['a', 'b'], ['a', 'b', 'c'], ['c']],
    [
      ['a', 'b'],
      ['a', 'a', 'c', 'd'],
      ['c', 'd']
    ]
  ])(
    'resource with the initial tags %s and selected tags %s adds %s',
    async (resourceTags, selectedTags, expected) => {
      const resource = mockDeep<Resource>({ tags: resourceTags })
      const clientService = mockDeep<ClientService>()
      const stub = clientService.graphAuthenticated.tags.assignTags.mockImplementation()
      const { wrapper } = createWrapper(resource, clientService)

      wrapper.vm.selectedTags = selectedTags

      await wrapper.vm.save()

      /* eslint-disable jest/no-conditional-expect*/
      if (expected.length) {
        expect(stub).toHaveBeenCalledWith(
          expect.objectContaining({
            tags: expected
          })
        )
      } else {
        expect(stub).not.toHaveBeenCalled()
      }
    }
  )

  test.each<[string[], string[], string[]]>([
    [['a', 'b'], ['a'], ['b']],
    [['a', 'b'], ['a', 'b', 'c'], []],
    [['a', 'b'], [], ['a', 'b']]
  ])(
    'resource with the initial tags %s and selected tags %s removes %s',
    async (resourceTags, selectedTags, expected) => {
      const resource = mockDeep<Resource>({ tags: resourceTags })
      const clientService = mockDeep<ClientService>()
      const stub = clientService.graphAuthenticated.tags.unassignTags.mockImplementation()
      const { wrapper } = createWrapper(resource, clientService)

      wrapper.vm.selectedTags = selectedTags

      await wrapper.vm.save()

      /* eslint-disable jest/no-conditional-expect*/
      if (expected.length) {
        expect(stub).toHaveBeenCalledWith(
          expect.objectContaining({
            tags: expected
          })
        )
      } else {
        expect(stub).not.toHaveBeenCalled()
      }
    }
  )

  it('logs error on failure', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    const clientService = mockDeep<ClientService>()
    const assignTagsStub = clientService.graphAuthenticated.tags.assignTags
      .mockImplementation()
      .mockRejectedValue(new Error())
    const resource = mockDeep<Resource>({ tags: ['a'] })
    const eventStub = jest.spyOn(eventBus, 'publish')
    const { wrapper } = createWrapper(resource, clientService)
    wrapper.vm.selectedTags.push('b')
    await wrapper.vm.save()
    expect(assignTagsStub).toHaveBeenCalled()
    expect(eventStub).not.toHaveBeenCalled()
  })

  it('does not accept tags consisting of blanks only', () => {
    const { wrapper } = createWrapper(mockDeep<Resource>())
    const option = wrapper.vm.createOption(' ')
    expect(option.error).toBeDefined()
    expect(option.selectable).toBeFalsy()
  })
})

function createWrapper(resource, clientService = mockDeep<ClientService>()) {
  return {
    wrapper: mount(TagsPanel, {
      global: {
        plugins: [...defaultPlugins(), createStore(defaultStoreMockOptions)],
        mocks: { ...defaultComponentMocks(), $clientService: clientService },
        stubs: defaultStubs,
        provide: { resource }
      }
    })
  }
}

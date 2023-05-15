import List from '../../../src/views/List.vue'
import { providerStore } from '../../../src/service'
import { defaultComponentMocks, mount } from 'web-test-helpers'

const mockProvider = {
  id: 'p1',
  available: true,
  reset: jest.fn(),
  updateTerm: jest.fn(),
  activate: jest.fn(),
  listSearch: {
    search: jest.fn()
  } as any
}

beforeEach(() => {
  providerStore.providers = [mockProvider]
})

describe('search result List view', () => {
  it('requests the listSearch from the current active provider', () => {
    const { wrapper } = getWrapper()
    expect(wrapper.vm.$data.listSearch).toMatchObject(mockProvider.listSearch)
  })
  it('triggers the search', async () => {
    const { wrapper } = getWrapper()
    await wrapper.vm.search('term')
    expect(mockProvider.listSearch.search).toHaveBeenCalledTimes(1)
  })
})

const getWrapper = () => {
  const mocks = { ...defaultComponentMocks() }
  mocks.$route.query = { provider: 'p1' }
  return {
    wrapper: mount(List, {
      global: { mocks }
    })
  }
}

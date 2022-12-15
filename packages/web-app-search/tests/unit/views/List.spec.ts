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
  providerStore.providers = []
})

describe('search result List view', () => {
  test('it requests the listSearch from the current active provider', () => {
    providerStore.providers = [mockProvider]
    const mocks = { ...defaultComponentMocks() }
    mocks.$route.query = { provider: 'p1' }
    const wrapper = mount(List, {
      global: {
        stubs: {
          OcSpinner: true
        },
        mocks
      }
    })
    expect(wrapper.vm.$data.listSearch).toMatchObject(mockProvider.listSearch)
  })
})

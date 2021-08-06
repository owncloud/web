import List from '../../../src/views/List.vue'
import { Wrapper, mount, createLocalVue } from '@vue/test-utils'
import AsyncComputed from 'vue-async-computed'
import { providerStore } from '../../../src/service'

const localVue = createLocalVue()
localVue.use(AsyncComputed)

let wrapper: Wrapper<any>
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
  jest.resetAllMocks()
  providerStore.providers = []
})

afterEach(() => {
  wrapper.destroy()
})

describe('search result List view', () => {
  test('it requests the listSearch from the current active provider', () => {
    providerStore.providers = [mockProvider]
    wrapper = mount(List, {
      localVue,
      stubs: {
        OcSpinner: true
      },
      mocks: {
        $route: {
          query: {
            provider: 'p1'
          }
        }
      }
    })
    expect(wrapper.vm.$data.listSearch).toMatchObject(mockProvider.listSearch)
  })
})

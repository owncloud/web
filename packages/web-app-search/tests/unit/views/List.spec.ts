import List from '../../../src/views/List.vue'
import { defaultComponentMocks, mount } from 'web-test-helpers'
import { useAvailableProviders } from '../../../src/composables'
import { ref } from 'vue'
import { SearchProvider, queryItemAsString } from '@ownclouders/web-pkg'
import { mock } from 'jest-mock-extended'

const mockProvider = mock<SearchProvider>({
  id: 'p1',
  available: true,
  listSearch: {
    search: jest.fn()
  }
})

jest.mock('../../../src/composables/useAvailableProviders')
jest.mock('@ownclouders/web-pkg', () => ({
  ...jest.requireActual('@ownclouders/web-pkg'),
  useRouteQuery: jest.fn(),
  queryItemAsString: jest.fn()
}))

describe('search result List view', () => {
  it('requests the listSearch from the current active provider', () => {
    const { wrapper } = getWrapper()
    expect(wrapper.vm.listSearch).toMatchObject(mockProvider.listSearch)
  })
  it('by default loading is true', () => {
    const { wrapper } = getWrapper()
    expect(wrapper.vm.loading).toBeTruthy()
  })
  it('triggers the search', async () => {
    const { wrapper } = getWrapper()
    await wrapper.vm.search('term')
    expect(mockProvider.listSearch.search).toHaveBeenCalledTimes(1)
  })
})

const getWrapper = () => {
  jest.mocked(useAvailableProviders).mockReturnValue(ref([mockProvider]))
  jest.mocked(queryItemAsString).mockReturnValue('p1')
  const mocks = { ...defaultComponentMocks() }
  return {
    wrapper: mount(List, {
      global: { mocks }
    })
  }
}

import { mock } from 'jest-mock-extended'
import {
  createStore,
  defaultComponentMocks,
  defaultStoreMockOptions,
  getComposableWrapper
} from 'web-test-helpers'
import { useSearch } from '../../../../src/composables'
import { ConfigurationManager } from '../../../../src/configuration'

jest.mock('../../../../src/composables/configuration', () => ({
  useConfigurationManager: () =>
    mock<ConfigurationManager>({
      options: {
        routing: {
          fullShareOwnerPaths: false,
          idBased: true
        }
      }
    })
}))

describe('useSearch', () => {
  describe('method "search"', () => {
    it('can search', async () => {
      const files = [
        { id: 'foo', name: 'foo', fileInfo: {} },
        { id: 'bar', name: 'bar', fileInfo: {} },
        { id: 'baz', name: 'baz', fileInfo: {} }
      ]

      const wrapper = createWrapper({ resources: files })

      const noTermResult = await wrapper.vm.search('')
      expect(noTermResult).toEqual({ totalResults: null, values: [] })

      const withTermResult = await wrapper.vm.search('foo')
      expect(withTermResult.values.map((r) => r.data)).toMatchObject(files)
    })
    it('properly returns space resources', async () => {
      const files = [{ id: 'foo', name: 'foo', parentFolderId: '2' }]

      const wrapper = createWrapper({ resources: files })

      const withTerm = await wrapper.vm.search('foo')
      expect(withTerm.values.map((r) => r.data)[0].id).toEqual('2')
    })
  })
})

const createWrapper = ({ resources = [] }: { resources?: any[] } = {}) => {
  const storeOptions = { ...defaultStoreMockOptions }
  storeOptions.getters.capabilities.mockImplementation(() => ({
    spaces: { projects: true, share_jail: true }
  }))
  storeOptions.modules.runtime.modules.spaces.getters.spaces = jest.fn(() => [
    {
      id: '1',
      fileId: '1',
      driveType: 'personal',
      getDriveAliasAndItem: () => 'personal/admin'
    },
    {
      id: '2',
      driveType: 'project',
      name: 'New space',
      getDriveAliasAndItem: jest.fn()
    }
  ])
  const store = createStore(storeOptions)
  const mocks = defaultComponentMocks({})

  mocks.$clientService.webdav.search.mockResolvedValue({
    resources,
    totalResults: resources.length
  })

  return getComposableWrapper(
    () => {
      const { search } = useSearch()

      return {
        search
      }
    },
    {
      mocks,
      provide: mocks,
      store
    }
  )
}

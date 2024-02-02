import { defaultComponentMocks, getComposableWrapper } from 'web-test-helpers'
import { CapabilityStore, useSearch } from '../../../../src/composables'
import { SpaceResource } from '@ownclouders/web-client'

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
  const spaces = [
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
      getDriveAliasAndItem: vi.fn()
    }
  ] as unknown as SpaceResource[]

  const mocks = defaultComponentMocks({})
  const capabilities = {
    spaces: { projects: true }
  } satisfies Partial<CapabilityStore['capabilities']>

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
      pluginOptions: {
        piniaOptions: { spacesState: { spaces }, capabilityState: { capabilities } }
      }
    }
  )
}

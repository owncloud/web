import { ref, readonly } from '@vue/composition-api'
import { createWrapper } from './spec'
import { SortDir, SortOptions, useSort } from '../../../../src/composables'
import { Resource } from '../../../../src/helpers/resource'

describe('useSort', () => {
  it('should be valid', () => {
    expect(useSort).toBeDefined()
  })

  it('does not sort if no sort field was given', () => {
    createWrapper(() => {
      const input: SortOptions<any> = {
        items: readonly([
          { id: '1', path: '1', webDavPath: '/1' },
          { id: '2', path: '2', webDavPath: '/2' },
          { id: '3', path: '3', webDavPath: '/3' }
        ]),
        fields: [],
        sortBy: ref(null),
        sortDir: ref(null),
        routeName: 'mocked'
      }

      const { items } = useSort(input)

      expect(items.value).toMatchObject([
        { id: '1', path: '1', webDavPath: '/1' },
        { id: '2', path: '2', webDavPath: '/2' },
        { id: '3', path: '3', webDavPath: '/3' }
      ])
    })
  })

  describe('sorting resources', () => {
    const resources = [
      { id: '1', name: 'c.png', path: '', webDavPath: '', time: 2 },
      { id: '1', name: 'Dir4', path: '', webDavPath: '', time: 4, type: 'folder' },
      { id: '1', name: 'a.png', path: '', webDavPath: '', time: 3 },
      { id: '1', name: 'A.png', path: '', webDavPath: '', time: 6 },
      { id: '1', name: 'dir2', path: '', webDavPath: '', time: 7, type: 'folder' },
      { id: '1', name: 'b.png', path: '', webDavPath: '', time: 1 },
      { id: '1', name: 'Dir1', path: '', webDavPath: '', time: 5, type: 'folder' },
      { id: '1', name: 'dir3', path: '', webDavPath: '', time: 8, type: 'folder' }
    ]

    it('sorts resources by name', () => {
      createWrapper(() => {
        const sortDir = ref(SortDir.Asc)
        const input = {
          items: readonly<Resource[]>(resources),
          fields: [
            {
              name: 'name',
              sortable: true
            },
            {
              name: 'time',
              sortable: true
            }
          ],
          sortBy: ref('name'),
          sortDir
        }

        const { items } = useSort<Resource>(input)

        expect(items.value.map((i) => i.name)).toMatchObject([
          'Dir1',
          'dir2',
          'dir3',
          'Dir4',
          'a.png',
          'A.png',
          'b.png',
          'c.png'
        ])

        sortDir.value = SortDir.Desc
        expect(items.value.map((i) => i.name)).toMatchObject([
          'c.png',
          'b.png',
          'a.png',
          'A.png',
          'Dir4',
          'dir3',
          'dir2',
          'Dir1'
        ])
      })
    })
  })
})

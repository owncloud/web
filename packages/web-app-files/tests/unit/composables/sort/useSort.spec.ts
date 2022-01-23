import { ref, readonly } from '@vue/composition-api'
import { createWrapper } from './spec'
import { SortDir, SortOptions, useSort } from '../../../../src/composables'

describe('useSort', () => {
  it('should be valid', () => {
    expect(useSort).toBeDefined()
  })

  it('does not sort if no sort field was given', () => {
    createWrapper(() => {
      const input: SortOptions<any> = {
        items: readonly([3, 4, 6, 1, 2, 5]),
        fields: [],
        sortBy: ref(null),
        sortDir: ref(null),
        routeName: 'mocked'
      }

      const { items } = useSort(input)

      expect(items.value).toMatchObject([3, 4, 6, 1, 2, 5])
    })
  })

  describe('sorting resources', () => {
    interface Resource {
      name: string
    }
    const resources = [
      { name: 'c.png', time: 2 },
      { name: 'Dir4', time: 4, type: 'folder' },
      { name: 'a.png', time: 3 },
      { name: 'A.png', time: 6 },
      { name: 'dir2', time: 7, type: 'folder' },
      { name: 'b.png', time: 1 },
      { name: 'Dir1', time: 5, type: 'folder' },
      { name: 'dir3', time: 8, type: 'folder' }
    ]

    it('sorts resources by name', () => {
      createWrapper(() => {
        const sortDir = ref(SortDir.Asc)
        const input = {
          items: readonly<Array<Resource>>(resources),
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

        const { items } = useSort(input)

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

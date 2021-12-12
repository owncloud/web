import { ref, readonly, unref } from '@vue/composition-api'
import { createWrapper } from './spec'
import { SortDir, useSort } from '../../../../src/composables'

describe('useSort', () => {
  it('should be valid', () => {
    expect(useSort).toBeDefined()
  })

  it('does not sort if no field is sortable', () => {
    createWrapper(() => {
      const input = {
        items: readonly([3, 4, 6, 1, 2, 5]),
        fields: [],
        sortBy: null,
        sortDir: null
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
          sortBy: 'name',
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

    it('sorts by first sortable field if sortBy and sortDir are not provided', () => {
      createWrapper(() => {
        const input = {
          items: readonly<Array<Resource>>(resources),
          fields: [
            {
              name: 'name'
            },
            {
              name: 'time',
              sortable: true
            }
          ]
        }

        const { items, sortBy, sortDir } = useSort(input)
        expect(unref(sortBy)).toEqual('time')
        expect(unref(sortDir)).toEqual(SortDir.Asc)
        expect(items.value.map((i) => i.name)).toMatchObject([
          'b.png',
          'c.png',
          'a.png',
          'Dir4',
          'Dir1',
          'A.png',
          'dir2',
          'dir3'
        ])
      })
    })
  })
})

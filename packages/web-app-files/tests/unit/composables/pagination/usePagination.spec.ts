import { ref } from '@vue/composition-api'
import { createWrapper } from './spec'
import { usePagination } from '../../../../src/composables'

jest.unmock('@files/src/composables')

describe('usePagination', () => {
  it('should be valid', () => {
    expect(usePagination).toBeDefined()
  })

  it('calculates the items per page', () => {
    createWrapper(() => {
      const input = {
        items: ref([1, 2, 3, 4, 5]),
        page: ref(1),
        perPage: ref(2)
      }

      const { items } = usePagination(input)

      expect(items.value).toMatchObject([1, 2])

      input.page.value = 2
      expect(items.value).toMatchObject([3, 4])

      input.page.value = 3
      expect(items.value).toMatchObject([5])

      input.items.value.push(6)
      expect(items.value).toMatchObject([5, 6])

      input.perPage.value = 3
      expect(items.value).toMatchObject([])

      input.items.value.push(7)
      expect(items.value).toMatchObject([7])

      input.page.value = 2
      expect(items.value).toMatchObject([4, 5, 6])
    })
  })

  it('calculates number of pages', () => {
    createWrapper(() => {
      const input = {
        items: ref([1, 2]),
        page: 1,
        perPage: ref(2)
      }

      const { total } = usePagination(input)

      expect(total.value).toBe(1)

      input.items.value.push(3)
      expect(total.value).toBe(2)

      input.perPage.value = 1
      expect(total.value).toBe(3)

      input.perPage.value = 3
      expect(total.value).toBe(1)

      input.items.value.push(4, 5, 6)
      expect(total.value).toBe(2)

      input.items.value.push(7)
      expect(total.value).toBe(3)
    })
  })

  it('handles situations where perPage is falsy (even 0)', () => {
    createWrapper(() => {
      const input = {
        items: ref([1, 2, 3, 4, 5]),
        page: 1,
        perPage: ref(2)
      }

      const { total, items } = usePagination(input)
      expect(total.value).toBe(3)
      expect(items.value.length).toBe(2)

      input.perPage.value = parseInt('AllOrWhatEver')

      expect(total.value).toBe(1)
      expect(items.value.length).toBe(5)
    })
  })
})

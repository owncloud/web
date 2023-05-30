import { ref, unref } from 'vue'
import { usePagination } from 'web-app-admin-settings/src/composables'
import { queryItemAsString } from 'web-pkg/src'
import { getComposableWrapper } from 'web-test-helpers'

jest.mock('web-pkg/src/composables/appDefaults')
jest.mock('web-pkg/src/composables/router')

describe('usePagination', () => {
  describe('paginatedItems', () => {
    const items = [1, 2, 3, 4, 5, 6]

    it.each([
      { currentPage: 1, itemsPerPage: 100, expected: [1, 2, 3, 4, 5, 6] },
      { currentPage: 1, itemsPerPage: 2, expected: [1, 2] },
      { currentPage: 2, itemsPerPage: 2, expected: [3, 4] }
    ])('returns proper paginated items', ({ currentPage, itemsPerPage, expected }) => {
      getWrapper({
        setup: ({ paginatedItems }) => {
          expect(unref(paginatedItems)).toEqual(expected)
        },
        items,
        currentPage,
        itemsPerPage
      })
    })
  })
})

function getWrapper({
  setup,
  items,
  currentPage,
  itemsPerPage
}: {
  setup: (instance: ReturnType<typeof usePagination>) => void
  items: any[]
  currentPage: number
  itemsPerPage: number
}) {
  jest.mocked(queryItemAsString).mockImplementationOnce(() => currentPage.toString())
  jest.mocked(queryItemAsString).mockImplementationOnce(() => itemsPerPage.toString())
  return {
    wrapper: getComposableWrapper(() => {
      const instance = usePagination({ items: ref(items) })
      setup(instance)
    })
  }
}

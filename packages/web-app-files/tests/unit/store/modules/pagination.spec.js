import paginationModule from '../../../../src/store/modules/pagination.js'

describe('pagination store module', () => {
  test('updating items per page', () => {
    const state = { itemsPerPage: 100 }
    const { SET_ITEMS_PER_PAGE } = paginationModule.mutations
    SET_ITEMS_PER_PAGE(state, 500)

    expect(state.itemsPerPage).toEqual(500)
    expect(window.localStorage.getItem('oc_filesPageLimit')).toEqual('500')
  })

  test('updating current page', () => {
    const state = { page: 1 }
    const { UPDATE_CURRENT_PAGE } = paginationModule.mutations
    UPDATE_CURRENT_PAGE(state, 2)

    expect(state.page).toEqual(1)
  })

  test('calculation of available pages', () => {
    const state = { itemsPerPage: 2 }
    const pages = paginationModule.getters.pages(state, undefined, undefined, {
      'Files/filesAll': ['file-1', 'file-2', 'file-3', 'file-4', 'file-5']
    })

    expect(pages).toBe(3)
  })
})

export default {
  namespaced: true,
  state: () => ({
    currentPage: 1,
    itemsPerPage: 10
  }),
  mutations: {
    SET_ITEMS_PER_PAGE(state, limit) {
      state.itemsPerPage = limit

      window.localStorage.setItem('oc_filesPageLimit', limit)
    },
    UPDATE_CURRENT_PAGE(state, page) {
      state.currentPage = parseInt(page)
    }
  },
  getters: {
    pages: (state, getters, rootState, rootGetters) => {
      const allFiles = rootGetters['Files/filesAll']

      return Math.ceil(allFiles.length / state.itemsPerPage)
    }
  }
}

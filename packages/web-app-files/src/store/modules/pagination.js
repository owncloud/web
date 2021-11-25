export default {
  namespaced: true,
  state: () => ({
    currentPage: 1,
    itemsPerPage: 100
  }),
  mutations: {
    SET_ITEMS_PER_PAGE(state, limit) {
      state.itemsPerPage = parseInt(limit)

      window.localStorage.setItem('oc_filesPageLimit', limit)
    },
    UPDATE_CURRENT_PAGE(state, page) {
      state.currentPage = parseInt(page)
    }
  },
  getters: {
    pages: (state, getters, rootState, rootGetters) => {
      if (!state.itemsPerPage) {
        return 1
      }

      const allFiles = rootGetters['Files/filesAll']
      return Math.ceil(allFiles.length / state.itemsPerPage)
    }
  }
}

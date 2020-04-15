const namespaced = true

const state = {
  pageCount: null,
  activePage: 1
}

const actions = {
  loadPages({ commit }, pages) {
    commit('LOAD_PAGES', pages)
  },
  changePage({ commit }, page) {
    commit('CHANGE_PAGE', page)
  }
}

const mutations = {
  CHANGE_PAGE(state, page) {
    state.activePage = page
  },
  LOAD_PAGES(state, pages) {
    state.pageCount = pages
  }
}

const getters = {
  pageCount: state => {
    return state.pageCount
  },
  currentPage: state => {
    return state.activePage
  }
}

export default {
  namespaced,
  state,
  actions,
  mutations,
  getters
}

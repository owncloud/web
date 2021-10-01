const state = {
  mimeTypes: {}
}

const actions = {
  async fetchMimeTypes(context, url: string): Promise<void> {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Error fetching app provider MIME types')
    }

    const mimeTypes = await response.json()

    context.commit('SET_MIME_TYPES', mimeTypes['mime-types'])
  }
}

const getters = {
  getMimeTypes: state => {
    return state.mimeTypes
  }
}

const mutations = {
  SET_MIME_TYPES(state, mimeTypes): void {
    state.mimeTypes = mimeTypes
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
}

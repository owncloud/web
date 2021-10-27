import { Commit } from 'vuex'
const State = {
  mimeTypes: {}
}

const actions = {
  async fetchMimeTypes({
    rootGetters,
    commit
  }: {
    rootGetters: any
    commit: Commit
  }): Promise<void> {
    if (!rootGetters.capabilities.files.app_providers[0]?.enabled) {
      return
    }
    const serverUrl = rootGetters.configuration.server
    const appList = rootGetters.capabilities.files.app_providers[0].apps_url
    const url = serverUrl + appList.replace('/app', 'app')

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Error fetching app provider MIME types')
    }

    const mimeTypes = await response.json()
    commit('SET_MIME_TYPES', mimeTypes['mime-types'])
  }
}

const getters = {
  getMimeTypes: (state: typeof State): { [key: string]: string } => {
    return state.mimeTypes
  }
}

const mutations = {
  SET_MIME_TYPES(state: typeof State, mimeTypes: { [key: string]: string }): void {
    state.mimeTypes = mimeTypes
  }
}

export default {
  namespaced: true,
  state: State,
  actions,
  mutations,
  getters
}

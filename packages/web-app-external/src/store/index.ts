import { Commit } from 'vuex'
import { urlJoin } from 'web-client/src/utils'
import { configurationManager } from '@ownclouders/web-pkg'
import { v4 as uuidV4 } from 'uuid'

interface AppProvider {
  icon: string
  name: string
}

/* eslint-disable camelcase */
interface MimeType {
  allow_creation?: boolean
  app_providers: Array<AppProvider>
  default_application?: string
  description?: string
  ext?: string
  mime_type: string
  name?: string
}
/* eslint-enable camelcase */

const State = {
  mimeTypes: []
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

    const url = urlJoin(
      configurationManager.serverUrl,
      rootGetters.capabilities.files.app_providers[0].apps_url
    )

    const response = await fetch(url, { headers: { 'X-Request-ID': uuidV4() } })

    if (!response.ok) {
      throw new Error('Error fetching app provider MIME types')
    }

    const { 'mime-types': mimeTypes } = await response.json()
    commit('SET_MIME_TYPES', mimeTypes)
  }
}

const getters = {
  mimeTypes: (state: typeof State): Array<MimeType> => {
    return state.mimeTypes
  }
}

const mutations = {
  SET_MIME_TYPES(state: typeof State, mimeTypes: Array<MimeType>): void {
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

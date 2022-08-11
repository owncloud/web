import { buildSpace } from 'web-client/src/helpers'
import Vue from 'vue'
import { set, has } from 'lodash-es'

const state = {
  spaces: []
}

const getters = {
  spaces: (state) => state.spaces
}

const mutations = {
  LOAD_SPACES(state, spaces) {
    state.spaces = spaces
  },
  /**
   * Updates a single space field. If the space with given id doesn't exist nothing will happen.
   *
   * @param state Current state of this store module
   * @param params
   * @param params.id Id of the resource to be updated
   * @param params.field the resource field that the value should be applied to
   * @param params.value the value that will be attached to the key
   */
  UPDATE_SPACE_FIELD(state, params) {
    const spaceSource = state.spaces
    const index = state.spaces.findIndex((r) => r.id === params.id)
    if (index < 0) {
      return
    }

    const resource = spaceSource[index]
    const isReactive = has(resource, params.field)
    const newResource = set(resource, params.field, params.value)

    if (isReactive) {
      return
    }

    Vue.set(spaceSource, index, newResource)
  },
  UPSERT_SPACE(state, space) {
    const spaces = [...state.spaces]
    const index = spaces.findIndex((r) => r.id === space.id)
    const found = index > -1

    if (found) {
      spaces.splice(index, 1, space)
    } else {
      spaces.push(space)
    }
    state.spaces = spaces
  },
  REMOVE_SPACE(state, space) {
    state.spaces = state.spaces.filter((s) => s.id !== space.id)
  },
  CLEAR_SPACES(state) {
    state.spaces = []
  }
}

const actions = {
  async loadSpaces(context, { graphClient }) {
    const graphResponse = await graphClient.drives.listMyDrives()
    if (!graphResponse.data) {
      return
    }

    const spaces = graphResponse.data.value.map((space) => buildSpace(space))
    context.commit('LOAD_SPACES', spaces)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

const state = {
  messages: [],
  quickActions: {}
}

const actions = {
  showMessage({ commit }, message) {
    commit('ENQUEUE_MESSAGE', message)
  },
  deleteMessage(context, mId) {
    context.commit('REMOVE_MESSAGE', mId)
  }
}

const mutations = {
  ENQUEUE_MESSAGE(state, message) {
    // set random id to improve iteration in v-for & lodash
    if (!message.id) {
      message.id = Math.random().toString(36).slice(2, -1)
    }

    state.messages.push(message)
  },
  REMOVE_MESSAGE(state, item) {
    state.messages.splice(state.messages.indexOf(item), 1)
  },
  ADD_QUICK_ACTIONS(state, quickActions) {
    state.quickActions = Object.assign(state.quickActions, quickActions)
  }
}

const getters = {
  activeMessages: (state) => {
    return state.messages
  }
}

export default {
  state,
  actions,
  mutations,
  getters
}

const state = {
  messages: []
}

const actions = {
  showErrorMessage({ commit }, message) {
    const getXRequestID = (error: any): string | null => {
      /**
       * x-request-id response headers might be very nested in ownCloud SDK,
       * only remove records if you are sure they aren't valid anymore
       */
      if (error.response?.res?.res?.headers?.['x-request-id']) {
        return error.response.res.res.headers['x-request-id']
      }
      if (error.response?.headers?.map?.['x-request-id']) {
        return error.response.headers.map['x-request-id']
      }
      if (error.response?.res?.headers?.['x-request-id']) {
        return error.response.res.headers['x-request-id']
      }
      if (error.response?.headers?.['x-request-id']) {
        return error.response.headers['x-request-id']
      }
      return null
    }

    message.status = message.status || 'danger'
    message.timeout = message.timeout || 0
    message.errors = message.error ? [message.error] : message.errors || []

    const xRequestIds = message.errors
      .map((error) => getXRequestID(error))
      .filter((xRequestId) => xRequestId !== null)
      .map((item) => `X-Request-Id: ${item}`)
      .join('\r\n')

    message.errorLogContent = xRequestIds

    commit('ENQUEUE_MESSAGE', message)
  },
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

const state = {
  messages: [],
  notifications: {
    loading: true,
    failed: false,
    data: []
  }
}

const actions = {
  toggleSidebar(context, visible) {
    context.commit('TOGGLE_SIDEBAR', visible)
  },
  showMessage(context, message) {
    context.commit('ENQUEUE_MESSAGE', message)
  },
  deleteMessage(context, mId) {
    context.commit('REMOVE_MESSAGE', mId)
  },
  fetchNotifications(context, client) {
    context.commit('LOADING_NOTIFICATIONS', true)

    return client.requests
      .ocs({
        service: 'apps/notifications',
        action: 'api/v1/notifications'
      })
      .then(response => {
        response.json().then(json => {
          if (response.ok) {
            context.commit('UPDATE_NOTIFICATIONS', json.ocs.data)
          } else {
            context.commit('ERROR_NOTIFICATIONS', json.ocs.meta.message)
          }
          context.commit('LOADING_NOTIFICATIONS', false)
        })
      })
      .catch(error => {
        context.commit('ERROR_NOTIFICATIONS', error)
        context.commit('LOADING_NOTIFICATIONS', false)
      })
  },
  deleteNotification(context, { client, notification }) {
    client.requests
      .ocs({
        service: 'apps/notifications',
        action: 'api/v1/notifications/' + notification,
        method: 'DELETE'
      })
      .then(response => {
        if (response.ok) {
          context.commit('DELETE_NOTIFICATION', notification)
        } else {
          context.commit('ERROR_NOTIFICATIONS', response.ocs.meta.status)
        }
      })
      .catch(error => {
        context.commit('ERROR_NOTIFICATIONS', error)
      })
  }
}

const mutations = {
  ENQUEUE_MESSAGE(state, message) {
    // set random id to improve iteration in v-for & lodash
    if (!message.id)
      message.id = Math.random()
        .toString(36)
        .slice(2, -1)
    state.messages.push(message)
  },
  REMOVE_MESSAGE(state, item) {
    state.messages.splice(state.messages.indexOf(item), 1)
  },
  LOADING_NOTIFICATIONS(state, loading) {
    state.notifications.loading = loading
  },
  ERROR_NOTIFICATIONS(state, failed) {
    state.notifications.failed = failed
  },
  UPDATE_NOTIFICATIONS(state, notifications) {
    state.notifications.data = notifications
  },
  DELETE_NOTIFICATION(state, notification) {
    const data = state.notifications.data.filter(n => {
      return n.notification_id !== notification
    })
    state.notifications.data = data
  }
}

const getters = {
  activeMessages: state => {
    return state.messages
  },
  activeNotifications: state => {
    return state.notifications.data.length && !state.notifications.failed
      ? state.notifications.data
      : false
  }
}

export default {
  state,
  actions,
  mutations,
  getters
}

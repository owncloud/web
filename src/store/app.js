'use strict'

import { remove } from 'lodash'

const state = {
  sidebarVisible: false,
  notifications: []
}

const actions = {
  toggleSidebar (context, visible) {
    context.commit('TOGGLE_SIDEBAR', visible)
  },
  showNotification (context, notification) {
    context.commit('ENQUEUE_NOTIFICATION', notification)
  },
  deleteNotification (context, nId) {
    context.commit('REMOVE_NOTIFICATION', nId)
  }
}

const mutations = {
  TOGGLE_SIDEBAR (state, visible) {
    state.sidebarVisible = visible
  },
  ENQUEUE_NOTIFICATION (state, notification) {
    // set random id to improve iteration in v-for & lodash
    if (!notification.id) notification.id = Math.random().toString(36).slice(2, -1)
    state.notifications.push(notification)
  },
  REMOVE_NOTIFICATION (state, nId) {
    let notifications = remove(state.notifications, (n) => {
      return n.id !== nId
    })
    state.notifications = notifications
  }
}

const getters = {
  isSidebarVisible: state => {
    return state.sidebarVisible
  },
  activeNotifications: state => {
    return (state.notifications.length) ? [state.notifications[0]] : []
  }
}

export default {
  state,
  actions,
  mutations,
  getters
}

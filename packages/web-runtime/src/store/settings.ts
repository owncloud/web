import keyBy from 'lodash-es/keyBy'
import assign from 'lodash-es/assign'
import findKey from 'lodash-es/findKey'
import isNil from 'lodash-es/isNil'
import isEqual from 'lodash-es/isEqual'

const state = {
  settingsValues: null
}

const actions = {
  clearSettingsValues({ commit }) {
    commit('SET_SETTINGS_VALUES', null)
  }
}

const mutations = {
  SET_SETTINGS_VALUES(state, settingsValues) {
    if (settingsValues === null) {
      state.settingsValues = null
    } else {
      state.settingsValues = keyBy(settingsValues, 'value.id')
    }
  },
  SET_SETTINGS_VALUE(state, settingsValue) {
    state.settingsValues = assign({}, state.settingsValues, {
      [settingsValue.value.id]: settingsValue
    })
  }
}

const getters = {
  settingsValuesLoaded: (state) => {
    return state.settingsValues !== null
  },
  // calling this getter requires either having the `settingId` or all three other params
  hasSettingsValue:
    (state, getters) =>
    ({ settingId, extension, bundle, setting }) => {
      return getters.getSettingsValue({ settingId, extension, bundle, setting }) !== null
    },
  // calling this getter requires either having the `settingId` or all three other params
  getSettingsValue:
    (state, getters) =>
    ({ settingId, extension, bundle, setting }) => {
      if (!getters.settingsValuesLoaded) {
        return null
      }
      if (settingId) {
        const key = findKey(
          state.settingsValues,
          (settingsValue) => settingsValue.value.settingId === settingId
        )
        return isNil(key) ? null : state.settingsValues[key].value
      }
      const key = findKey(state.settingsValues, (settingsValue) =>
        isEqual(settingsValue.identifier, {
          extension,
          bundle,
          setting
        })
      )
      return isNil(key) ? null : state.settingsValues[key].value
    }
}

export default {
  state,
  actions,
  mutations,
  getters
}

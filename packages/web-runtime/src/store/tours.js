import { createTranslatedTourInfos } from '../helpers/tours'

const state = {
  _tours: {},
  translatedTourInfos: {},
  currentTranslatedTourInfos: []
}

const mutations = {
  SET_TOUR_INFOS(state, tourInfos) {
    state._tourInfos = tourInfos
  },
  SET_TRANSLATED_TOUR_INFOS(state, translatedTourInfos) {
    state.translatedTourInfos = translatedTourInfos
  },
  SET_CURRENT_TRANSLATED_TOUR_INFOS(state, currentTranslatedTourInfos) {
    state.currentTranslatedTourInfos = currentTranslatedTourInfos
  }
}

const getters = {
  tours: (state) => {
    return state.tourss
  },
  translatedTourInfos: (state) => {
    return state.translatedTourInfos
  },
  currentTranslatedTourInfos: (state) => {
    return state.currentTranslatedTourInfos
  }
}

const actions = {
  setAllTranslatedTourInfos(context, tourInfos) {
    context.commit('SET_TOUR_INFOS', tourInfos)
    const translatedTourInfos = createTranslatedTourInfos(tourInfos) || []
    context.commit('SET_TRANSLATED_TOUR_INFOS', translatedTourInfos)
  },
  setCurrentTranslatedTourInfos(context, languageCode) {
    const language = languageCode || document.documentElement.lang
    const currentTranslatedTourInfos = context.state.translatedTourInfos[language] || []
    context.commit('SET_CURRENT_TRANSLATED_TOUR_INFOS', currentTranslatedTourInfos)
  }
}
export default {
  state,
  mutations,
  getters,
  actions
}

const emptyReturn = () => {}

const state = {
  displayed: false,
  variation: 'passive',
  icon: '',
  title: '',
  message: '',
  cancelText: '',
  confirmText: '',
  // Input values
  confirmDisabled: false,
  hasInput: false,
  inputDisabled: false,
  inputValue: '',
  inputPlaceholder: '',
  inputLabel: '',
  inputError: '',
  // Events
  onCancel: emptyReturn,
  onConfirm: emptyReturn,
  onInput: emptyReturn
}

const actions = {
  createModal({ commit }, modal) {
    commit('CREATE_MODAL', modal)
  },

  hideModal({ commit }) {
    commit('HIDE_MODAL')
  },

  setModalInputErrorMessage({ commit }, error) {
    commit('SET_INPUT_ERROR_MESSAGE', error)
  },

  toggleModalConfirmButton({ commit }) {
    commit('TOGGLE_MODAL_CONFIRM_BUTTON')
  }
}

const mutations = {
  CREATE_MODAL(state, modal) {
    state.displayed = true
    state.variation = modal.variation || 'passive'
    state.icon = modal.icon
    state.title = modal.title
    state.message = modal.message
    state.cancelText = modal.cancelText || 'Cancel'
    state.confirmText = modal.confirmText || 'Confirm'
    state.confirmDisabled = modal.confirmDisabled || false
    state.onCancel = modal.onCancel
    state.onConfirm = modal.onConfirm
    state.hasInput = modal.hasInput || false
    state.inputValue = modal.inputValue || null
    state.inputDescription = modal.inputDescription || null
    state.inputLabel = modal.inputLabel || null
    state.inputError = modal.inputError || null
    state.inputDisabled = modal.inputDisabled || false
    state.onInput = modal.onInput || emptyReturn
  },

  HIDE_MODAL(state) {
    state.displayed = false
  },

  SET_INPUT_ERROR_MESSAGE(state, error) {
    state.inputError = error
  },

  TOGGLE_MODAL_CONFIRM_BUTTON(state) {
    state.confirmDisabled = !state.confirmDisabled
  }
}

export default {
  state,
  actions,
  mutations
}

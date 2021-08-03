const optionsState = {
  options: {
    hideSearchBar: false
  }
}

const getters = {
  options: (state: typeof optionsState): unknown => {
    return state.options
  }
}

export default {
  state: optionsState,
  getters
}

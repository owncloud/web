export default {
  SET_ACTIVE_STYLES(state, payload: { name: string; value: number }) {
    state.styles = state.styles.map((style) =>
      style.name.toLowerCase() === payload.name.toLowerCase()
        ? { ...style, value: payload.value }
        : style
    )
  },
  RESET_STYLES(state) {
    state.styles = state.styles.map()
  }
}

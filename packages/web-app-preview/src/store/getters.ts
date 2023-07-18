export default {
  customizeGeneral: (state) => {
    return state.styles.filter(
      (style) =>
        style.name.toLowerCase() === 'brightness' ||
        style.name.toLowerCase() === 'contrast' ||
        style.name.toLowerCase() === 'saturation' ||
        style.name.toLowerCase() === 'blur'
    )
  },
  customizeFineTune: (state) => {
    return state.styles.filter(
      (style) =>
        style.name.toLowerCase() === 'exposure' ||
        style.name.toLowerCase() === 'highlights' ||
        style.name.toLowerCase() === 'shadows'
    )
  },
  allStyles: (state) => {
    return state.styles
  }
}

import { StyleCategoryEnum } from '../helpers'

export default {
  customizeGeneral: (state) => {
    return state.styles.filter((style) => style.type === StyleCategoryEnum.General)
  },
  customizeFineTune: (state) => {
    return state.styles.filter((style) => style.type === StyleCategoryEnum.FineTune)
  },
  allStyles: (state) => {
    return state.styles
  },
  getSelectedStyleProp: (state) => {
    return state.selectedStyleProp
  }
}

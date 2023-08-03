import { AdjustmentParametersCategoryEnum } from '../helpers'

export default {
  generalParameters: (state) => {
    return state.adjustmentParameters.filter(
      (adjustmentParameter) => adjustmentParameter.type === AdjustmentParametersCategoryEnum.General
    )
  },
  fineTuneParameters: (state) => {
    return state.adjustmentParameters.filter(
      (adjustmentParameter) =>
        adjustmentParameter.type === AdjustmentParametersCategoryEnum.FineTune
    )
  },
  miscellaneousParameters: (state) => {
    return state.adjustmentParameters.filter(
      (adjustmentParameter) =>
        adjustmentParameter.type === AdjustmentParametersCategoryEnum.Miscellaneous
    )
  },
  allParameters: (state) => {
    return state.adjustmentParameters
  },
  getSelectedProcessingTool: (state) => {
    return state.selectedProcessingTool
  },
  getCroppedCanvas: (state) => {
    return state.croppedCanvas
  },
  getCropVariant: (state) => {
    return state.cropVariant
  }
}

import { AdjustmentParametersCategoryEnum, AdjustmentParametersCategoryType } from '../helpers'

export default {
  generalParameters: (state) => {
    return state.adjustmentParameters.filter(
      (adjustmentParameter: AdjustmentParametersCategoryType) =>
        adjustmentParameter.category === AdjustmentParametersCategoryEnum.General
    )
  },
  fineTuneParameters: (state) => {
    return state.adjustmentParameters.filter(
      (adjustmentParameter: AdjustmentParametersCategoryType) =>
        adjustmentParameter.category === AdjustmentParametersCategoryEnum.FineTune
    )
  },
  miscellaneousParameters: (state) => {
    return state.adjustmentParameters.filter(
      (adjustmentParameter: AdjustmentParametersCategoryType) =>
        adjustmentParameter.category === AdjustmentParametersCategoryEnum.Miscellaneous
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

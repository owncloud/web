import {
  CropVariantEnum,
  AdjustmentParametersCategoryType,
  AdjustmentParametersTypeEnum
} from '../helpers'

export default {
  SET_ACTIVE_ADJUSTMENT_PARAMETERS(state, payload: { name: string; value: number | boolean }) {
    state.adjustmentParameters = state.adjustmentParameters.map((adjustmentParameter) =>
      adjustmentParameter.name.toLowerCase() === payload.name.toLowerCase()
        ? { ...adjustmentParameter, value: payload.value }
        : adjustmentParameter
    )
  },
  RESET_ADJUSTMENT_PARAMETERS(state) {
    state.adjustmentParameters = state.adjustmentParameters.map(
      (adjustmentParameter: AdjustmentParametersCategoryType) => {
        switch (adjustmentParameter.type) {
          case AdjustmentParametersTypeEnum.Boolean:
            return { ...adjustmentParameter, value: false }
          default:
            return { ...adjustmentParameter, value: 0 }
        }
      }
    )
  },
  CHANGE_SELECTED_PROCESSING_TOOL(state, name: string) {
    state.selectedProcessingTool === name
      ? (state.selectedProcessingTool = null)
      : (state.selectedProcessingTool = name)
  },
  RESET_SELECTED_PROCESSING_TOOL(state) {
    state.selectedProcessingTool = null
  },
  UPDATE_CROPPED_CANVAS(state, canvas) {
    state.croppedCanvas = canvas
  },
  RESET_CROPPED_CANVAS(state) {
    state.croppedCanvas = null
  },
  SET_CROP_VARIANT(state, cropType: CropVariantEnum) {
    state.cropVariant = cropType
  },
  RESET_CROP_VARIANT(state) {
    state.cropVariant = CropVariantEnum.FreeForm
  }
}

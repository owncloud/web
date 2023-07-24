export default {
  SET_ACTIVE_ADJUSTMENT_PARAMETERS(state, payload: { name: string; value: number }) {
    state.adjustmentParameters = state.adjustmentParameters.map((adjustmentParameter) =>
      adjustmentParameter.name.toLowerCase() === payload.name.toLowerCase()
        ? { ...adjustmentParameter, value: payload.value }
        : adjustmentParameter
    )
  },
  RESET_ADJUSTMENT_PARAMETERS(state) {
    state.adjustmentParameters = state.adjustmentParameters.map(
      (adjustmentParameter) => adjustmentParameter && { ...adjustmentParameter, value: 0 }
    )
  },
  CHANGE_SELECTED_PROCESSING_TOOL(state, name: string) {
    state.selectedProcessingTool === name
      ? (state.selectedProcessingTool = '')
      : (state.selectedProcessingTool = name)
  }
}

import {
  AdjustmentParametersCategoryEnum,
  AdjustmentParametersTypeEnum,
  CropVariantEnum
} from '../helpers'

export default {
  adjustmentParameters: [
    {
      name: 'Brightness',
      valueType: AdjustmentParametersTypeEnum.Number,
      value: 0,
      minValue: -100,
      maxValue: 100,
      type: AdjustmentParametersCategoryEnum.General
    },
    {
      name: 'Contrast',
      valueType: AdjustmentParametersTypeEnum.Number,
      value: 0,
      minValue: -100,
      maxValue: 100,
      type: AdjustmentParametersCategoryEnum.General
    },
    {
      name: 'Saturation',
      valueType: AdjustmentParametersTypeEnum.Number,
      value: 0,
      minValue: -100,
      maxValue: 100,
      type: AdjustmentParametersCategoryEnum.General
    },
    {
      name: 'Grayscale',
      valueType: AdjustmentParametersTypeEnum.Number,
      value: 0,
      minValue: 0,
      maxValue: 100,
      type: AdjustmentParametersCategoryEnum.General
    },
    {
      name: 'Exposure',
      valueType: AdjustmentParametersTypeEnum.Number,
      value: 0,
      minValue: -100,
      maxValue: 100,
      type: AdjustmentParametersCategoryEnum.FineTune
    },
    {
      name: 'Highlights',
      valueType: AdjustmentParametersTypeEnum.Number,
      value: 0,
      minValue: -100,
      maxValue: 100,
      type: AdjustmentParametersCategoryEnum.FineTune
    },
    {
      name: 'Shadows',
      valueType: AdjustmentParametersTypeEnum.Number,
      value: 0,
      minValue: -100,
      maxValue: 100,
      type: AdjustmentParametersCategoryEnum.FineTune
    },
    {
      name: 'Invert',
      valueType: AdjustmentParametersTypeEnum.Boolean,
      value: 0,
      minValue: 0,
      maxValue: 1,
      type: AdjustmentParametersCategoryEnum.Miscellaneous
    }
  ],
  selectedProcessingTool: null,
  croppedCanvas: null,
  cropVariant: CropVariantEnum.FreeForm
}

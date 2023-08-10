import {
  AdjustmentParametersCategoryEnum,
  AdjustmentParametersTypeEnum,
  CropVariantEnum
} from '../helpers'

export default {
  adjustmentParameters: [
    {
      name: 'Brightness',
      type: AdjustmentParametersTypeEnum.Number,
      value: 0,
      minValue: -100,
      maxValue: 100,
      category: AdjustmentParametersCategoryEnum.General
    },
    {
      name: 'Contrast',
      type: AdjustmentParametersTypeEnum.Number,
      value: 0,
      minValue: -100,
      maxValue: 100,
      category: AdjustmentParametersCategoryEnum.General
    },
    {
      name: 'Saturation',
      type: AdjustmentParametersTypeEnum.Number,
      value: 0,
      minValue: -100,
      maxValue: 100,
      category: AdjustmentParametersCategoryEnum.General
    },
    {
      name: 'Grayscale',
      type: AdjustmentParametersTypeEnum.Number,
      value: 0,
      minValue: 0,
      maxValue: 100,
      category: AdjustmentParametersCategoryEnum.General
    },
    {
      name: 'Hue-rotate',
      type: AdjustmentParametersTypeEnum.Number,
      value: 0,
      minValue: 0,
      maxValue: 360,
      category: AdjustmentParametersCategoryEnum.General
    },
    {
      name: 'Sepia',
      type: AdjustmentParametersTypeEnum.Number,
      value: 0,
      minValue: 0,
      maxValue: 100,
      category: AdjustmentParametersCategoryEnum.General
    },
    {
      name: 'Exposure',
      type: AdjustmentParametersTypeEnum.Number,
      value: 0,
      minValue: -100,
      maxValue: 100,
      category: AdjustmentParametersCategoryEnum.FineTune
    },
    {
      name: 'Highlights',
      type: AdjustmentParametersTypeEnum.Number,
      value: 0,
      minValue: -100,
      maxValue: 100,
      category: AdjustmentParametersCategoryEnum.FineTune
    },
    {
      name: 'Cooling',
      type: AdjustmentParametersTypeEnum.Number,
      value: 0,
      minValue: -100,
      maxValue: 100,
      category: AdjustmentParametersCategoryEnum.FineTune
    },
    {
      name: 'Vintage',
      type: AdjustmentParametersTypeEnum.Number,
      value: 0,
      minValue: -100,
      maxValue: 100,
      category: AdjustmentParametersCategoryEnum.FineTune
    },
    {
      name: 'Dramatic',
      type: AdjustmentParametersTypeEnum.Number,
      value: 0,
      minValue: -100,
      maxValue: 100,
      category: AdjustmentParametersCategoryEnum.FineTune
    },
    {
      name: 'Invert',
      type: AdjustmentParametersTypeEnum.Boolean,
      value: false,
      category: AdjustmentParametersCategoryEnum.Miscellaneous
    }
  ],
  selectedProcessingTool: null,
  croppedCanvas: null,
  cropVariant: CropVariantEnum.FreeForm
}

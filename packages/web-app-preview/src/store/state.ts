import { AdjustmentParametersCategoryEnum, CropVariantEnum } from '../helpers'

export default {
  adjustmentParameters: [
    {
      name: 'Brightness',
      value: 0,
      minValue: -100,
      maxValue: 100,
      type: AdjustmentParametersCategoryEnum.General
    },
    {
      name: 'Contrast',
      value: 0,
      minValue: -100,
      maxValue: 100,
      type: AdjustmentParametersCategoryEnum.General
    },
    {
      name: 'Saturation',
      value: 0,
      minValue: -100,
      maxValue: 100,
      type: AdjustmentParametersCategoryEnum.General
    },
    {
      name: 'Grayscale',
      value: 0,
      minValue: 0,
      maxValue: 100,
      type: AdjustmentParametersCategoryEnum.General
    },
    {
      name: 'Invert',
      value: 0,
      minValue: 0,
      maxValue: 100,
      type: AdjustmentParametersCategoryEnum.General
    },
    {
      name: 'Exposure',
      value: 0,
      minValue: -100,
      maxValue: 100,
      type: AdjustmentParametersCategoryEnum.FineTune
    },
    {
      name: 'Highlights',
      value: 0,
      minValue: -100,
      maxValue: 100,
      type: AdjustmentParametersCategoryEnum.FineTune
    },
    {
      name: 'Shadows',
      value: 0,
      minValue: -100,
      maxValue: 100,
      type: AdjustmentParametersCategoryEnum.FineTune
    }
  ],
  selectedProcessingTool: null,
  croppedCanvas: null,
  cropVariant: CropVariantEnum.FreeForm
}

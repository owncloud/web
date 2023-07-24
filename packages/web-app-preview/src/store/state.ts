import { StyleCategoryEnum } from '../helpers'

export default {
  styles: [
    {
      name: 'Brightness',
      value: 0,
      minValue: -100,
      maxValue: 100,
      type: StyleCategoryEnum.General
    },
    {
      name: 'Contrast',
      value: 0,
      minValue: -100,
      maxValue: 100,
      type: StyleCategoryEnum.General
    },
    {
      name: 'Saturation',
      value: 0,
      minValue: -100,
      maxValue: 100,
      type: StyleCategoryEnum.General
    },
    {
      name: 'Grayscale',
      value: 0,
      minValue: 0,
      maxValue: 100,
      type: StyleCategoryEnum.General
    },
    {
      name: 'Invert',
      value: 0,
      minValue: 0,
      maxValue: 100,
      type: StyleCategoryEnum.General
    },
    {
      name: 'Exposure',
      value: 0,
      minValue: -100,
      maxValue: 100,
      type: StyleCategoryEnum.FineTune
    },
    {
      name: 'Highlights',
      value: 0,
      minValue: -100,
      maxValue: 100,
      type: StyleCategoryEnum.FineTune
    },
    {
      name: 'Shadows',
      value: 0,
      minValue: -100,
      maxValue: 100,
      type: StyleCategoryEnum.FineTune
    }
  ],
  selectedStyleProp: ''
}

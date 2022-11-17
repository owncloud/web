import Vue from 'vue'
import DesignSystem from './index'

const options = {
  tokens: {
    breakpoints: {
      'xsmall-max': '50px'
    },
    colorPalette: {
      'background-default': '#ef23ab',
      'swatch-brand-default': '#00FFFF'
    },
    fontSizes: {
      default: '1.358rem'
    },
    sizes: {
      'icon-default': '12pt'
    },
    spacing: {
      small: '20px'
    }
  }
}

Vue.use(DesignSystem, options)

describe('Depending on what gets passed into the theming options', () => {
  it('Sets correct custom CSS props from theming options', () => {
    expect(document.documentElement.style.getPropertyValue('--oc-breakpoint-xsmall-max')).toMatch(
      '50px'
    )
    expect(
      document.documentElement.style.getPropertyValue('--oc-color-background-default')
    ).toMatch('#ef23ab')
    expect(
      document.documentElement.style.getPropertyValue('--oc-color-swatch-brand-default')
    ).toMatch('#00FFFF')
    expect(document.documentElement.style.getPropertyValue('--oc-font-size-default')).toMatch(
      '1.358rem'
    )
    expect(document.documentElement.style.getPropertyValue('--oc-size-icon-default')).toMatch(
      '12pt'
    )
    expect(document.documentElement.style.getPropertyValue('--oc-space-small')).toMatch('20px')
  })
  // eslint-disable-next-line
  // it('Defaults to ODS colors where none are passed in theming options', () => {
  //   expect(document.documentElement.style.getPropertyValue('--oc-color')).toMatch("green")
  //   expect(document.documentElement.style.getPropertyValue('--oc-brand-primary-hover')).toMatch('#223959')
  // })
})

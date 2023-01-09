import Vue, { configureCompat } from 'vue'
import { config } from '@vue/test-utils'
import fetchMock from 'jest-fetch-mock'

import * as directives from '@ownclouders/design-system/src/directives'
import { compatConfig } from '../../../packages/web-runtime/src/compatConfig'

configureCompat(compatConfig)

window.define = jest.fn()

window.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn()
}))
fetchMock.enableMocks()

config.mocks = {
  $language: {
    current: 'en'
  },
  language: 'en'
}

Vue.component('RouterLink', {
  props: {
    tag: { type: String, default: 'a' },
    to: { type: [String, Object], default: '' }
  },
  render(createElement) {
    let path = this.$props.to

    if (!!path && typeof path !== 'string') {
      path = this.$props.to.path || this.$props.to.name

      if (this.$props.to.params) {
        path += '/' + Object.values(this.$props.to.params).join('/')
      }

      if (this.$props.to.query) {
        path += '?' + Object.values(this.$props.to.query).join('&')
      }
    }

    return createElement(this.tag, { attrs: { href: path } }, this.$slots.default)
  }
})

Object.values(directives).forEach((d) => Vue.directive(d.name, d))

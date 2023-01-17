import Vue, { configureCompat, h } from 'vue'
import { config } from '@vue/test-utils'
import fetchMock from 'jest-fetch-mock'

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
  name: 'RouterLink',
  props: {
    tag: { type: String, default: 'a' },
    to: { type: [String, Object], default: '' }
  },
  render() {
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

    return h(this.tag, { attrs: { href: path } }, this.$slots.default)
  }
})

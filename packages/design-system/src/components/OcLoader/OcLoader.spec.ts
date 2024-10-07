import OcLoader from './OcLoader.vue'
import { mount } from '@ownclouders/web-test-helpers'

describe('OcLoader', () => {
  function getWrapper(props = {}) {
    return mount(OcLoader, {
      props: props
    })
  }
  it('should set provided aria-label', () => {
    const wrapper = getWrapper({ ariaLabel: 'test' })
    expect(wrapper.attributes('aria-label')).toBe('test')
  })
  describe('when prop flat is enabled', () => {
    it('should set loader flat class to the wrapper', () => {
      const wrapper = getWrapper({ flat: true })
      expect(wrapper.attributes('class')).toContain('oc-loader-flat')
    })
  })
})

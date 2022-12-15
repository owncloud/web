import OcImage from './OcImage.vue'
import { mount } from '@vue/test-utils'

describe('OcImage', () => {
  function getWrapper(props = {}) {
    return mount(OcImage, {
      propsData: {
        src: 'http://someimage.jpg',
        ...props
      }
    })
  }
  it('should set the provided src', () => {
    const wrapper = getWrapper()
    expect(wrapper.attributes('src')).toBe('http://someimage.jpg')
  })
  it('should set the provided title for image', () => {
    const wrapper = getWrapper({ title: 'test title' })
    expect(wrapper.attributes('title')).toBe('test title')
  })
  it.each(['eager', 'lazy'])('should set the provided loading type for image', (loadingType) => {
    const wrapper = getWrapper({ loadingType: loadingType })
    expect(wrapper.attributes('loading')).toBe(loadingType)
  })
  it('should not accept value other than (lazy & eager) for prop loading type', () => {
    expect(() => {
      getWrapper({ loadingType: 'invalid' })
    }).toThrow(`[Vue warn]: Invalid prop: custom validator check failed for prop "loadingType".`)
  })
  describe('when alt is set', () => {
    const wrapper = getWrapper({ alt: 'test alt text' })
    it('should set the provided alt for image', () => {
      expect(wrapper.attributes('alt')).toBe('test alt text')
    })
    it('should disable aria hidden property', () => {
      expect(wrapper.attributes('aria-hidden')).toBe(undefined)
    })
  })
  describe('when alt is not set', () => {
    it('should disable aria hidden property', () => {
      const wrapper = getWrapper()
      expect(wrapper.attributes('aria-hidden')).toBe('true')
    })
  })
})

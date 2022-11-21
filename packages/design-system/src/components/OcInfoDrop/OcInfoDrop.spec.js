import OcInfoDrop from './OcInfoDrop.vue'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import GetTextPlugin from 'vue-gettext'

const localVue = createLocalVue()
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

describe('OcInfoDrop', () => {
  function getWrapperWithProps(props) {
    return shallowMount(OcInfoDrop, {
      localVue: localVue,
      propsData: props,
      stubs: {
        OcDrop: true
      }
    })
  }
  describe('should use props correctly', () => {
    it('should set title prop', () => {
      const wrapper = getWrapperWithProps({ title: 'test-my-title' })
      expect(wrapper.find('.info-title').text()).toBe('test-my-title')
    })
    it('should set text prop', () => {
      const wrapper = getWrapperWithProps({ text: 'test-my-text' })
      expect(wrapper.find('.info-text').text()).toBe('test-my-text')
    })
    it('should set list prop', async () => {
      const listValues = [
        { text: 'a-list-value' },
        { text: 'b-list-value' },
        { text: 'c-list-value' }
      ]
      const wrapper = getWrapperWithProps({ list: listValues })
      const result = wrapper.find('.info-list').text()
      listValues.forEach((value) => {
        expect(result).toContain(value.text)
      })
    })
    it('should set a readMore link', async () => {
      const wrapper = getWrapperWithProps({ readMoreLink: 'owncloud.design' })
      const attributes = wrapper.find('.info-more-link').attributes()
      expect(attributes['href']).toBe('owncloud.design')
      expect(attributes['target']).toBe('_blank')
    })
    it('should set end-text prop', async () => {
      const wrapper = getWrapperWithProps({ endText: 'test-my-text' })
      expect(wrapper.find('.info-text-end').text()).toBe('test-my-text')
    })
  })
})

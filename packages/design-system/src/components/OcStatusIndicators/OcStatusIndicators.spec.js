import StatusIndicators from './OcStatusIndicators.vue'
import { mount } from '@vue/test-utils'

const fileResource = {
  name: 'forest.jpg',
  path: 'nature/forest.jpg',
  thumbnail: 'https://cdn.pixabay.com/photo/2015/09/09/16/05/forest-931706_960_720.jpg',
  indicators: [],
  type: 'file',
  isFolder: false,
  extension: 'jpg'
}
const indicator = {
  id: 'testid',
  label: 'testlabel',
  type: 'testtype',
  handler: jest.fn()
}
describe('OcStatusIndicators', () => {
  it('does call indicator handler on click', () => {
    const spyHandler = jest.spyOn(indicator, 'handler')
    const wrapper = mount(StatusIndicators, {
      propsData: {
        resource: fileResource,
        indicators: [indicator],
        target: 'test'
      }
    })
    wrapper.find('.oc-status-indicators-indicator').trigger('click')
    expect(spyHandler).toHaveBeenCalled()
  })
  it('does create indicator with id', () => {
    const wrapper = mount(StatusIndicators, {
      propsData: {
        resource: fileResource,
        indicators: [indicator],
        target: 'test'
      }
    })
    expect(wrapper.find(`#${indicator.id}`).exists()).toBeTruthy()
  })
})

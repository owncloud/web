import { config, shallowMount, mount } from '@vue/test-utils'
import OcAccordionItem from './OcAccordionItem.vue'

config.showDeprecationWarnings = false

describe('OcAccordionItem', () => {
  const mockMethods = {
    toggleExpanded: jest.fn()
  }
  function getWrapperWithProps(props) {
    return shallowMount(OcAccordionItem, {
      propsData: {
        title: 'Test title',
        ...props
      }
    })
  }
  function getWrapperWithMockMethods() {
    return mount(OcAccordionItem, {
      propsData: {
        title: 'Test title'
      },
      methods: mockMethods
    })
  }
  it('should set item id if given', () => {
    const wrapper = getWrapperWithProps({
      id: 'test-item-id',
      titleId: 'test-title-id',
      contentId: 'test-content-id'
    })
    expect(wrapper.attributes('id')).toContain('test-item-id')
    expect(wrapper.find('h3').attributes('id')).toBe('test-title-id')
    expect(wrapper.find('.oc-accordion-content').attributes('id')).toBe('test-content-id')
  })
  it('should render title as heading with provided heading level', () => {
    const wrapper = getWrapperWithProps({ headingLevel: '2' })
    const titleElement = wrapper.find('h2')
    expect(titleElement.exists()).toBeTruthy()
    expect(titleElement.attributes('class')).toBe('oc-accordion-title')
    expect(titleElement.find('.oc-accordion-title-text').text()).toBe('Test title')
  })
  describe('description prop', () => {
    describe('when description is given', () => {
      it('should render given description', () => {
        const wrapper = getWrapperWithProps({
          description: 'Test description'
        })
        const descriptionElement = wrapper.find('.oc-accordion-description')
        expect(descriptionElement.exists()).toBeTruthy()
        expect(descriptionElement.find('.oc-text-muted').text()).toBe('Test description')
      })
    })
    describe('when description is not given', () => {
      it('should not render description inside title', () => {
        const wrapper = getWrapperWithProps({})
        const descriptionElement = wrapper.find('.oc-accordion-description')
        expect(descriptionElement.exists()).toBeFalsy()
      })
    })
  })

  describe('icon prop', () => {
    describe('when icon is not given', () => {
      let wrapper
      wrapper = getWrapperWithProps({})
      it('should not render any icon', () => {
        const titleHeadingSpan = wrapper.find('.oc-accordion-title > oc-button-stub > span')
        expect(titleHeadingSpan.findAll('.oc-mr-s').length).toBe(0)
      })
    })
    describe('when icon is given', () => {
      it('should render an icon beside title', () => {
        const wrapper = getWrapperWithProps({
          icon: 'mdi-icon'
        })
        const titleHeadingSpan = wrapper.find('.oc-accordion-title > oc-button-stub > span')
        expect(titleHeadingSpan.findAll('.oc-mr-s').length).toBe(1)
      })
    })
  })
  describe('toggle expanded', () => {
    // https://forum.vuejs.org/t/test-this-parent-emit/42688/2
    // cannot test if parent emits or not from the child component
    // only checks if the toggle method is called or not
    it('when title button is clicked', async () => {
      const wrapper = getWrapperWithMockMethods()
      const titleButton = wrapper.find('.oc-accordion-title button')
      await titleButton.trigger('click')
      expect(mockMethods.toggleExpanded).toHaveBeenCalledTimes(1)
    })
  })
})

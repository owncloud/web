import { shallowMount } from 'web-test-helpers'
import OcAccordionItem from './OcAccordionItem.vue'

describe('OcAccordionItem', () => {
  it('should set item id if given', () => {
    const wrapper = getWrapper({
      id: 'test-item-id',
      titleId: 'test-title-id',
      contentId: 'test-content-id'
    })
    expect(wrapper.attributes('id')).toContain('test-item-id')
    expect(wrapper.find('h3').attributes('id')).toBe('test-title-id')
    expect(wrapper.find('.oc-accordion-content').attributes('id')).toBe('test-content-id')
  })
  it('should render title as heading with provided heading level', () => {
    const wrapper = getWrapper({ headingLevel: '2' })
    const titleElement = wrapper.find('h2')
    expect(titleElement.exists()).toBeTruthy()
    expect(titleElement.attributes('class')).toBe('oc-accordion-title')
    expect(titleElement.find('.oc-accordion-title-text').text()).toBe('Test title')
  })
  describe('description prop', () => {
    describe('when description is given', () => {
      it('should render given description', () => {
        const wrapper = getWrapper({
          description: 'Test description'
        })
        const descriptionElement = wrapper.find('.oc-accordion-description')
        expect(descriptionElement.exists()).toBeTruthy()
        expect(descriptionElement.find('.oc-text-muted').text()).toBe('Test description')
      })
    })
    describe('when description is not given', () => {
      it('should not render description inside title', () => {
        const wrapper = getWrapper({})
        const descriptionElement = wrapper.find('.oc-accordion-description')
        expect(descriptionElement.exists()).toBeFalsy()
      })
    })
  })

  describe('icon prop', () => {
    describe('when icon is not given', () => {
      const wrapper = getWrapper({})
      it('should not render any icon', () => {
        const titleHeadingSpan = wrapper.find('.oc-accordion-title > .oc-button > span')
        expect(titleHeadingSpan.findAll('.oc-mr-s').length).toBe(0)
      })
    })
    describe('when icon is given', () => {
      it('should render an icon beside title', () => {
        const wrapper = getWrapper({
          icon: 'mdi-icon'
        })
        const titleHeadingSpan = wrapper.find('.oc-accordion-title > .oc-button > span')
        expect(titleHeadingSpan.findAll('.oc-mr-s').length).toBe(1)
      })
    })
  })
  describe('toggle expanded', () => {
    // https://forum.vuejs.org/t/test-this-parent-emit/42688/2
    // cannot test if parent emits or not from the child component
    // only checks if the toggle method is called or not
    it('when title button is clicked', async () => {
      const toggleExpandedSpy = jest.spyOn((OcAccordionItem as any).methods, 'toggleExpanded')
      const wrapper = getWrapper()
      const titleButton = wrapper.findComponent('.oc-accordion-title .oc-button')
      await titleButton.trigger('click')
      expect(toggleExpandedSpy).toHaveBeenCalledTimes(1)
    })
  })
})

function getWrapper(props = {}) {
  return shallowMount(OcAccordionItem, {
    props: {
      title: 'Test title',
      ...props
    },
    global: {
      stubs: {
        OcButton: false
      }
    }
  })
}

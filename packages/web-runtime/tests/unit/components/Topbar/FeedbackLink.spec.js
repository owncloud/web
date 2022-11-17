import FeedbackLink from '../../../../src/components/Topbar/FeedbackLink'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import { axe, toHaveNoViolations } from 'jest-axe'
import DesignSystem from '@ownclouders/design-system'
const localVue = createLocalVue()
localVue.use(DesignSystem)
const OcTooltip = jest.fn()
expect.extend(toHaveNoViolations)

describe('FeedbackLink component', () => {
  it('has no accessibility violations', async () => {
    const wrapper = mount(FeedbackLink, {
      localVue,
      directives: {
        OcTooltip
      }
    })

    expect(
      await axe(wrapper.html(), {
        rules: {
          region: { enabled: false }
        }
      })
    ).toHaveNoViolations()
    expect(wrapper).toMatchSnapshot()
  })

  describe('properties', () => {
    let wrapper
    beforeEach(() => {
      wrapper = shallowMount(FeedbackLink, {
        stubs: {
          'oc-button': true,
          'oc-icon': true
        },
        directives: {
          'oc-tooltip': jest.fn()
        }
      })
    })
    it('allows to overwrite the link href', async () => {
      const url = 'https://some-link.tld/'
      await wrapper.setProps({ href: url })
      expect(wrapper.find('oc-button-stub').attributes().href).toEqual(url)
    })
    it('allows to overwrite the link ariaLabel', async () => {
      const ariaLabel = 'some aria label'
      await wrapper.setProps({ ariaLabel })
      expect(wrapper.find('oc-button-stub').attributes()['aria-label']).toEqual(ariaLabel)
    })
    it('allows to overwrite the link description', async () => {
      const description = 'some lengthy description'
      await wrapper.setProps({ description })
      expect(wrapper.find('#oc-feedback-link-description').text()).toEqual(description)
    })
  })
})

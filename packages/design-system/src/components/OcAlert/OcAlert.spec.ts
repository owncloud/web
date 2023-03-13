import { mount } from 'web-test-helpers'
import OcAlert from './OcAlert.vue'

describe('OcAlert', () => {
  const selectors = {
    closeButton: '.oc-alert-close-button',
    icon: '.oc-alert-icon'
  }
  describe('prop value', () => {
    describe('when alert is closeable', () => {
      it('should render close button and remove alert when close button is clicked', async () => {
        const wrapper = getWrapper({
          closeable: true
        })

        const alertCloseButton = wrapper.find(selectors.closeButton)
        expect(alertCloseButton.exists()).toBeTruthy()
        await alertCloseButton.trigger('click')

        expect(wrapper.find('.oc-alert').exists()).toBe(false)
      })
    })

    describe('when alert is not closeable', () => {
      it('should not render close button', () => {
        const wrapper = getWrapper({
          closeable: false
        })

        const alertCloseButton = wrapper.find(selectors.closeButton)
        expect(alertCloseButton.exists()).toBeFalsy()
      })
    })

    describe('when closeable is not set', () => {
      it('should not render close button', () => {
        const wrapper = getWrapper({
          closeable: undefined
        })

        const alertCloseButton = wrapper.find(selectors.closeButton)
        expect(alertCloseButton.exists()).toBeFalsy()
      })
    })

    // Test icons
    describe('custom icon is set', () => {
      it('should render the given icon', () => {
        const wrapper = getWrapper({
          customIcon: 'test-tube'
        })

        const icon = wrapper.find(selectors.icon)
        expect(icon.exists()).toBeTruthy()
      })
    })

    describe('hasIcon is set', () => {
      it('should render the icon', () => {
        const wrapper = getWrapper({
          hasIcon: true
        })

        const icon = wrapper.find(selectors.icon)
        expect(icon.exists()).toBeTruthy()
      })
    })

    describe('hasIcon is false', () => {
      it('should not render the icon', () => {
        const wrapper = getWrapper({
          hasIcon: false
        })

        const icon = wrapper.find(selectors.icon)
        expect(icon.exists()).toBe(false)
      })
    })

    describe('hasIcon not set', () => {
      it('should not render the icon', () => {
        const wrapper = getWrapper({
          hasIcon: undefined
        })

        const icon = wrapper.find(selectors.icon)
        expect(icon.exists()).toBe(false)
      })
    })

    // Test colors
    describe('when type is set to "info"', () => {
      it('should render the component as info alert', () => {
        const wrapper = getWrapper({
          variant: 'info'
        })

        const alert = wrapper.find('.oc-alert.oc-alert-info')
        expect(alert.exists()).toBeTruthy()

        // How to test for css class style settings?

        // const backgroundColor = styles.getPropertyValue('background-color')
        // const color = styles.getPropertyValue('color')
        // const borderColor = styles.getPropertyValue('border-color')

        // expect(backgroundColor).toBe('var(--oc-color-background-highlight)')
        // expect(color).toBe('var(--oc-color-swatch-primary-default)')
        // expect(borderColor).toBe('var(--oc-color-swatch-primary-default)')

        // const icon = wrapper.find(selectors.icon)
        // const svg = icon.find('svg')
        // expect(svg.attributes('style')).toContain('fill: var(--oc-color-swatch-primary-default)')
      })
    })

    describe('when type is set to "success"', () => {
      it('should render the component as success alert', () => {
        const wrapper = getWrapper({
          variant: 'success'
        })

        const alert = wrapper.find('.oc-alert.oc-alert-success')
        expect(alert.exists()).toBeTruthy()

        // expect(wrapper.attributes('style')).toContain(
        //   'background-color: var(--oc-color-swatch-success-background)'
        // )
        // expect(wrapper.attributes('style')).toContain(
        //   'color: var(--oc-color-swatch-success-default)'
        // )
        // expect(wrapper.attributes('style')).toContain(
        //   'border-color: var(--oc-color-swatch-success-default)'
        // )

        // const icon = wrapper.find(selectors.icon)
        // const svg = icon.find('svg')
        // expect(svg.attributes('style')).toContain('fill: var(--oc-color-swatch-success-default)')
      })
    })

    describe('when type is set to "warning"', () => {
      it('should render the component as warning alert', () => {
        const wrapper = getWrapper({
          variant: 'warning'
        })

        const alert = wrapper.find('.oc-alert.oc-alert-warning')
        expect(alert.exists()).toBeTruthy()

        // expect(wrapper.attributes('style')).toContain(
        //   'background-color: var(--oc-color-swatch-warning-background)'
        // )
        // expect(wrapper.attributes('style')).toContain(
        //   'color: var(--oc-color-swatch-warning-default)'
        // )
        // expect(wrapper.attributes('style')).toContain(
        //   'border-color: var(--oc-color-swatch-warning-default)'
        // )

        // const icon = wrapper.find(selectors.icon)
        // const svg = icon.find('svg')
        // expect(svg.attributes('style')).toContain('fill: var(--oc-color-swatch-warning-default)')
      })
    })

    describe('when type is set to "danger"', () => {
      it('should render the component as danger alert', () => {
        const wrapper = getWrapper({
          variant: 'danger'
        })

        const alert = wrapper.find('.oc-alert.oc-alert-danger')
        expect(alert.exists()).toBeTruthy()

        // expect(wrapper.attributes('style')).toContain(
        //   'background-color: var(--oc-color-swatch-danger-background)'
        // )
        // expect(wrapper.attributes('style')).toContain(
        //   'color: var(--oc-color-swatch-danger-default)'
        // )
        // expect(wrapper.attributes('style')).toContain(
        //   'border-color: var(--oc-color-swatch-danger-default)'
        // )

        // const icon = wrapper.find(selectors.icon)
        // const svg = icon.find('svg')
        // expect(svg.attributes('style')).toContain('fill: var(--oc-color-swatch-danger-default)')
      })
    })
  })
})

function getWrapper(props) {
  return mount(OcAlert, {
    props
  })
}

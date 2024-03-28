import { defaultPlugins, shallowMount } from 'web-test-helpers'
import Modal from './OcModal.vue'

const defaultProps = {
  title: 'Example title',
  message: 'Example message'
}

const inputProps = {
  title: 'Create new folder',
  hasInput: true,
  inputValue: 'New folder',
  inputLabel: 'Folder name'
}

describe('OcModal', () => {
  it('displays correct variation', () => {
    const wrapper = shallowMount(Modal, {
      props: {
        ...defaultProps,
        variation: 'danger'
      },
      global: { renderStubDefaultSlot: true, plugins: [...defaultPlugins()] }
    })

    expect(wrapper.findAll('.oc-modal-danger').length).toBe(1)
  })

  it('hides icon if not specified', () => {
    const wrapper = shallowMount(Modal, {
      global: { renderStubDefaultSlot: true, plugins: [...defaultPlugins()] },
      props: {
        ...defaultProps
      }
    })

    expect(wrapper.findAll('.oc-icon').length).toBe(0)
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('overrides props message with slot', () => {
    const wrapper = shallowMount(Modal, {
      global: { renderStubDefaultSlot: true, plugins: [...defaultPlugins()] },
      props: {
        ...defaultProps
      },
      slots: {
        content: '<p>Slot message</p>'
      }
    })

    expect(wrapper.find('.oc-modal-body-message > p').text()).toMatch('Slot message')
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(Modal, {
      global: { renderStubDefaultSlot: true, plugins: [...defaultPlugins()] },
      props: {
        ...defaultProps,
        icon: 'info'
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('displays input', () => {
    const wrapper = shallowMount(Modal, {
      global: { renderStubDefaultSlot: true, plugins: [...defaultPlugins()] },
      props: inputProps
    })

    expect(wrapper.findAll('.oc-modal-body-input').length).toBe(1)
    expect(wrapper.html()).toMatchSnapshot()
  })
})

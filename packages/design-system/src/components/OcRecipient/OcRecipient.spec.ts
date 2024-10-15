import { defaultPlugins, shallowMount } from '@ownclouders/web-test-helpers'
import Recipient from './OcRecipient.vue'
import { Recipient as RecipientType } from '../../helpers'

describe('OcRecipient', () => {
  function getWrapper(props: Partial<RecipientType> = undefined, slot: string = undefined) {
    const slots = slot ? { append: slot } : {}

    return shallowMount(Recipient, {
      props: {
        recipient: {
          name: 'alice',
          avatar: 'avatar.jpg',
          hasAvatar: true,
          isLoadingAvatar: false,
          ...props
        }
      },
      slots,
      global: { plugins: [...defaultPlugins()] }
    })
  }

  it('displays recipient name', () => {
    const wrapper = getWrapper()

    expect(wrapper.find('[data-testid="recipient-name"]').text()).toEqual('alice')
  })

  it('displays avatar', () => {
    const wrapper = getWrapper()

    expect(wrapper.find('[data-testid="recipient-avatar"]').attributes('src')).toEqual('avatar.jpg')
  })

  it('displays a spinner if avatar has not been loaded yet', () => {
    const wrapper = getWrapper({
      isLoadingAvatar: true
    })

    expect(wrapper.find('[data-testid="recipient-avatar-spinner"]').exists()).toBeTruthy()
  })

  it('displays an icon if avatar is not enabled', () => {
    const wrapper = getWrapper({
      icon: {
        name: 'person',
        label: 'User'
      },
      hasAvatar: false
    })

    const icon = wrapper.find('[data-testid="recipient-icon"]')

    expect(icon.exists()).toBeTruthy()
    expect(icon.attributes().accessiblelabel).toEqual('User')
  })

  it('display content in the append slot', () => {
    const wrapper = getWrapper({}, '<span id="test-slot">Hello world</span>')

    expect(wrapper.find('#test-slot').exists()).toBeTruthy()
  })

  it.each([
    [
      'name is not a string',
      {
        name: null
      }
    ],
    [
      'name is empty',
      {
        name: ''
      }
    ],
    ['icon name is not defined', { name: 'Alice', icon: {} }],
    ['icon name is not a string', { name: 'Alice', icon: { name: null } }],
    ['icon name is empty', { name: 'Alice', icon: { name: '' } }],
    ['icon label is not defined', { name: 'Alice', icon: { name: 'person' } }],
    ['icon label is not a string', { name: 'Alice', icon: { name: 'person', label: null } }],
    ['icon label is empty', { name: 'Alice', icon: { name: 'Alice', label: '' } }]
  ])('throws an error if %s', (def: string, prop: RecipientType) => {
    expect(() => shallowMount(Recipient, { props: { recipient: prop } })).toThrow(
      `Recipient ${def}`
    )
  })
})

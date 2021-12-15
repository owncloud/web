import { shallowMount, createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import GetTextPlugin from 'vue-gettext'

import ActionMenuItem from '@files/src/components/ActionMenuItem'
import { fileActions } from '../../__fixtures__/fileActions'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(DesignSystem)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const selectors = {
  handler: '[data-testid="action-handler"]',
  icon: '[data-testid="action-icon"]',
  img: '[data-testid="action-img"]',
  label: '[data-testid="action-label"]',
  srHint: '[data-testid="action-sr-hint"]'
}

describe('ActionMenuItem component', () => {
  it('renders an icon if there is one defined in the action', () => {
    const action = fileActions.download
    const wrapper = getShallowWrapper(action)
    expect(wrapper.find(selectors.icon).exists()).toBeTruthy()
    expect(wrapper.find(selectors.icon).attributes().name).toBe(action.icon)
  })
  it('renders an image if there is one defined in the action', () => {
    const action = { ...fileActions.download, img: 'https://owncloud.tld/img.png' }
    const wrapper = getShallowWrapper(action)
    expect(wrapper.find(selectors.icon).exists()).toBeFalsy()
    expect(wrapper.find(selectors.img).exists()).toBeTruthy()
    expect(wrapper.find(selectors.img).attributes().src).toBe(action.img)
  })
  it('renders the action label', () => {
    const action = fileActions.download
    const wrapper = getShallowWrapper(action)
    expect(wrapper.find(selectors.label).exists()).toBeTruthy()
    expect(wrapper.find(selectors.label).text()).toBe(action.label())
  })
  describe('component is of type oc-button', () => {
    it('calls the action handler on button click', async () => {
      const action = fileActions.download
      const spyHandler = jest.spyOn(action, 'handler')
      const wrapper = getWrapper(action)
      const button = wrapper.find(selectors.handler)
      expect(button.exists()).toBeTruthy()
      expect(button.element.tagName).toBe('BUTTON')
      await button.trigger('click')
      expect(spyHandler).toBeCalled()
    })
  })
  describe('component is of type router-link', () => {
    it('has a link', () => {
      const action = fileActions.navigate
      const wrapper = getWrapper(action)
      const link = wrapper.find(selectors.handler)
      expect(link.exists()).toBeTruthy()
      expect(link.element.tagName).toBe('ROUTER-LINK-STUB')
      // FIXME: to.name cannot be accessed, because the attributes().to holds a string containing `[object Object]`.
      // That doesn't allow checking the name of the router-link.
      // expect(link.attributes().href).toBe(action.route)
    })
  })
})

function getShallowWrapper(action, items = [], appearance = null) {
  return shallowMount(ActionMenuItem, {
    localVue,
    propsData: {
      action,
      items,
      ...(appearance && { appearance })
    }
  })
}

function getWrapper(action, items = [], appearance = null) {
  return mount(ActionMenuItem, {
    localVue,
    stubs: {
      'router-link': true
    },
    propsData: {
      action,
      items,
      ...(appearance && { appearance })
    }
  })
}

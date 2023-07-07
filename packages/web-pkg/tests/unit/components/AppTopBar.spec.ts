import { mock } from 'jest-mock-extended'
import { defaultPlugins, shallowMount } from 'web-test-helpers'
import { Resource } from 'web-client/src/helpers'
import AppTopBar from 'web-pkg/src/components/AppTopBar.vue'
import { Action } from 'web-pkg/src/composables/actions/types'

describe('AppTopBar', () => {
  describe('if no resource is present', () => {
    it('renders only a close button', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.html()).toMatchSnapshot()
    })
  })
  describe('if a resource is present', () => {
    it('renders a resource and no actions (if none given) and a close button', () => {
      const { wrapper } = getWrapper(mock<Resource>())
      expect(wrapper.html()).toMatchSnapshot()
    })

    it('renders a resource and mainActions (if given) and a close button', () => {
      const { wrapper } = getWrapper(mock<Resource>(), [mock<Action>()])
      expect(wrapper.html()).toMatchSnapshot()
    })
  })
})

function getWrapper(resource: Resource = null, mainActions: Action[] = []) {
  return {
    wrapper: shallowMount(AppTopBar, {
      props: {
        mainActions,
        resource
      },
      global: {
        plugins: [...defaultPlugins()]
      }
    })
  }
}

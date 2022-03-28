import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import { createLocalVue, mount } from '@vue/test-utils'
import SpaceContextActions from '../../../../src/components/Spaces/SpaceContextActions.vue'
import GetTextPlugin from 'vue-gettext'
import { createLocationSpaces } from '../../../../src/router'
import { buildSpace } from '../../../../src/helpers/resources'

const localVue = createLocalVue()
localVue.use(DesignSystem)
localVue.use(Vuex)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const spaceMock = {
  id: '1',
  root: { permissions: [{ roles: ['manager'], grantedTo: [{ user: { id: 1 } }] }] }
}

describe('SpaceContextActions', () => {
  describe('action handlers', () => {
    it('renders actions that are always available: "Members", "Deleted files", "Details"', () => {
      const wrapper = getWrapper(buildSpace(spaceMock))
      expect(wrapper).toMatchSnapshot()
    })
  })
})

function getWrapper(space) {
  return mount(SpaceContextActions, {
    localVue,
    store: createStore(),
    mocks: {
      $router: {
        currentRoute: createLocationSpaces('some-route'),
        resolve: (r) => {
          return { href: r.name }
        }
      }
    },
    propsData: {
      items: [space]
    }
  })
}

function createStore() {
  return new Vuex.Store({})
}

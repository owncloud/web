import { createLocalVue, shallowMount } from '@vue/test-utils'
import GetTextPlugin from 'vue-gettext'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import stubs from '@/tests/unit/stubs'
import DetailsAndEdit from '@files/src/components/SideBar/Shares/Links/DetailsAndEdit.vue'
import { LinkShareRoles } from '@files/src/helpers/share'

const localVue = createLocalVue()
localVue.use(DesignSystem)
localVue.use(Vuex)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const availableRoleOptions = LinkShareRoles.list(false, true).map((role) => {
  return {
    role,
    name: role.name,
    label: role.label
  }
})

const exampleLink = {
  name: 'Example link',
  url: 'https://some-url.com/abc',
  permissions: '1'
}

describe('DetailsAndEdit component', () => {
  describe('if user can not edit', () => {
    it('does not render dropdown or edit button', () => {
      const wrapper = getShallowMountedWrapper(exampleLink)
      expect(wrapper).toMatchSnapshot()
    })
  })

  describe('if user can edit', () => {
    it('renders dropdown and edit button', () => {
      const wrapper = getShallowMountedWrapper(exampleLink, false, true)
      expect(wrapper).toMatchSnapshot()
    })

    it.todo('test edit options, button clicks and event handling/propagation')
  })
})

function getShallowMountedWrapper(link, expireDateEnforced = false, modifiable = false) {
  return shallowMount(DetailsAndEdit, {
    propsData: {
      availableRoleOptions,
      expirationDate: {
        enforced: expireDateEnforced,
        default: null,
        min: 'Wed Apr 01 2020 00:00:00 GMT+0000 (Coordinated Universal Time)',
        max: null
      },
      link,
      modifiable,
      passwordEnforced: {
        read_only: false,
        upload_only: false,
        read_write: false
      }
    },
    store: createStore(),
    directives: {
      'oc-tooltip': jest.fn()
    },
    stubs: {
      ...stubs,
      'oc-datepicker': true
    }
  })
}

function createStore() {
  return new Vuex.Store({
    actions: {
      showMessage: jest.fn(),
      createModal: jest.fn(),
      hideModal: jest.fn()
    }
  })
}

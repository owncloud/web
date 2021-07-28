import stubs from '@/tests/unit/stubs/index.js'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import RoleItem from '@files/src/components/SideBar/Shared/RoleItem'

const localVue = createLocalVue()

const filesPersonalRoute = { name: 'files-personal' }

function getWrapper(route, role) {
  return shallowMount(RoleItem, {
    localVue,
    stubs: stubs,
    mocks: {
      $route: route
    },
    propsData: {
      role
    }
  })
}

describe('RoleItem', () => {
  const role = {
    id: 'dfdd3eddde',
    label: 'Viewer',
    description: 'Download, Preview and Share'
  }
  const wrapper = getWrapper(filesPersonalRoute, role)

  it('should display the roleItem correctly', () => {
    expect(wrapper).toMatchSnapshot()
  })
})

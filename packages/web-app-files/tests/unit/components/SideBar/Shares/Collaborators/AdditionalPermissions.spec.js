import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import DesignSystem from 'owncloud-design-system'
import AdditionalPermissions from '@files/src/components/SideBar/Shares/Collaborators/AdditionalPermissions.vue'

const localVue = createLocalVue()
localVue.use(DesignSystem)

const availablePermissions = [
  [
    {
      name: 'update',
      description: 'Allow editing',
      value: false
    }
  ],
  [
    {
      name: 'create',
      description: 'Allow creating',
      value: false
    }
  ],
  [
    {
      name: 'delete',
      description: 'Allow deleting',
      value: false
    }
  ],
  [
    {
      name: 'share',
      description: 'Allow sharing',
      value: false
    }
  ]
]

describe('AdditionalPermissions component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('prop "availablePermissions" is required', () => {
    expect(AdditionalPermissions.props.availablePermissions.required).toBe(true)
  })

  describe.each(availablePermissions)('when availablePermissions is provided', permission => {
    const availablePermission = {}
    availablePermission[permission.name] = permission
    const { name, description } = permission
    const checkboxSelector = '#files-collaborators-permission-' + name

    it(`should render "${permission.name}" permission check box`, () => {
      const wrapper = getShallowWrapper(availablePermission)

      const permissionCheckbox = wrapper.find(checkboxSelector)

      expect(permissionCheckbox.exists()).toBeTruthy()
      expect(permissionCheckbox.props().label).toBe(description)
    })
    it('should call "permissionChecked" if check box is checked', async () => {
      const spyPermissionChecked = jest.spyOn(AdditionalPermissions.methods, 'permissionChecked')
      const wrapper = getWrapper(availablePermission)

      const permissionCheckbox = wrapper.find(checkboxSelector)
      await permissionCheckbox.setChecked()

      expect(spyPermissionChecked).toHaveBeenCalledTimes(1)
      expect(wrapper.emitted().permissionChecked).toBeTruthy()
    })
  })
})

function getShallowWrapper(permissions = {}) {
  return shallowMount(AdditionalPermissions, {
    localVue,
    propsData: {
      availablePermissions: { ...permissions }
    }
  })
}

function getWrapper(permissions = {}) {
  return mount(AdditionalPermissions, {
    localVue,
    propsData: {
      availablePermissions: { ...permissions }
    },
    stubs: {
      'oc-grid': true,
      'oc-checkbox': false
    }
  })
}

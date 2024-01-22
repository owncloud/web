import LinkRoleDropdown from '../../../src/components/LinkRoleDropdown.vue'
import { defaultComponentMocks, defaultPlugins, mount } from 'web-test-helpers'
import { mock } from 'jest-mock-extended'
import {
  ShareRole,
  linkRoleInternalFolder,
  linkRoleViewerFolder
} from '@ownclouders/web-client/src/helpers'

const selectors = {
  currentRole: '.link-current-role',
  roleOption: '.role-dropdown-list li',
  roleOptionLabel: '.role-dropdown-list-option-label'
}

describe('LinkRoleDropdown', () => {
  it('renders the long label of the modelValue as button label', () => {
    const modelValue = mock<ShareRole>({ label: 'someLabel', longLabel: 'someLabel' })
    const { wrapper } = getWrapper({ modelValue })

    expect(wrapper.find(selectors.currentRole).text()).toEqual(modelValue.longLabel)
  })
  it('renders all available role options', () => {
    const modelValue = mock<ShareRole>({ label: 'someLabel', longLabel: 'someLabel' })
    const availableRoleOptions = [linkRoleInternalFolder, linkRoleViewerFolder]
    const { wrapper } = getWrapper({ modelValue, availableRoleOptions })

    expect(wrapper.findAll(selectors.roleOption).length).toEqual(availableRoleOptions.length)
    availableRoleOptions.forEach((role, index) => {
      expect(wrapper.findAll(selectors.roleOptionLabel).at(index).text()).toEqual(role.label)
    })
  })
})

function getWrapper({ modelValue = mock<ShareRole>(), availableRoleOptions = [] } = {}) {
  const mocks = { ...defaultComponentMocks() }

  return {
    mocks,
    wrapper: mount(LinkRoleDropdown, {
      props: {
        modelValue,
        availableRoleOptions
      },
      global: {
        plugins: [...defaultPlugins()],
        mocks,
        provide: mocks
      }
    })
  }
}

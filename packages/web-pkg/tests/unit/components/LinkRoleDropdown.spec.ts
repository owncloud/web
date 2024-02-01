import LinkRoleDropdown from '../../../src/components/LinkRoleDropdown.vue'
import { defaultComponentMocks, defaultPlugins, mount } from 'web-test-helpers'
import { mock } from 'vitest-mock-extended'
import { ShareRoleNG } from '@ownclouders/web-client/src/helpers'
import { SharingLinkType } from '@ownclouders/web-client/src/generated'
import { useLinkTypes } from '../../../src/composables/links/useLinkTypes'

vi.mock('../../../src/composables/links/useLinkTypes', () => ({
  useLinkTypes: vi.fn()
}))

const selectors = {
  currentRole: '.link-current-role',
  roleOption: '.role-dropdown-list li',
  roleOptionLabel: '.role-dropdown-list-option-label'
}

describe('LinkRoleDropdown', () => {
  it('renders the label of the corresponding role to the given link type', () => {
    const modelValue = SharingLinkType.Internal
    const { wrapper } = getWrapper({ modelValue })

    expect(wrapper.find(selectors.currentRole).text()).toEqual(modelValue)
  })
  it('renders all available role options based on the link types', () => {
    const modelValue = SharingLinkType.Internal
    const availableLinkTypeOptions = [SharingLinkType.Internal, SharingLinkType.View]
    const { wrapper } = getWrapper({ modelValue, availableLinkTypeOptions })

    expect(wrapper.findAll(selectors.roleOption).length).toEqual(availableLinkTypeOptions.length)
    availableLinkTypeOptions.forEach((role, index) => {
      expect(wrapper.findAll(selectors.roleOptionLabel).at(index).text()).toEqual(role)
    })
  })
})

function getWrapper({ modelValue = mock<SharingLinkType>(), availableLinkTypeOptions = [] } = {}) {
  vi.mocked(useLinkTypes).mockReturnValue(
    mock<ReturnType<typeof useLinkTypes>>({
      getLinkRoleByType: (value) =>
        mock<ShareRoleNG>({ displayName: value, description: value, label: value })
    })
  )

  const mocks = { ...defaultComponentMocks() }

  return {
    mocks,
    wrapper: mount(LinkRoleDropdown, {
      props: {
        modelValue,
        availableLinkTypeOptions
      },
      global: {
        plugins: [...defaultPlugins()],
        mocks,
        provide: mocks
      }
    })
  }
}

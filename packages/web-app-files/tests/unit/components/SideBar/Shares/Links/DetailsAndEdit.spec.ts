import DetailsAndEdit from 'web-app-files/src/components/SideBar/Shares/Links/DetailsAndEdit.vue'
import { LinkShare, ShareRole } from '@ownclouders/web-client/src/helpers/share'
import { defaultPlugins, shallowMount, defaultComponentMocks } from 'web-test-helpers'
import { mock } from 'vitest-mock-extended'
import { useLinkTypes } from '@ownclouders/web-pkg'
import { SharingLinkType } from '@ownclouders/web-client/src/generated'

vi.mock('@ownclouders/web-pkg', async (importOriginal) => ({
  ...(await importOriginal<any>()),
  useLinkTypes: vi.fn()
}))

const exampleLink = {
  displayName: 'Example link',
  webUrl: 'https://some-url.com/abc',
  type: SharingLinkType.View
} as LinkShare

describe('DetailsAndEdit component', () => {
  describe('if user can not edit', () => {
    it('does not render dropdown or edit button', () => {
      const { wrapper } = getShallowMountedWrapper(exampleLink)
      expect(wrapper.find('link-role-dropdown-stub').exists()).toBeFalsy()
      expect(wrapper.find('.edit-drop-trigger').exists()).toBeFalsy()
    })
  })

  describe('if user can edit', () => {
    it('renders dropdown and edit button', () => {
      const { wrapper } = getShallowMountedWrapper(exampleLink, false, true)
      expect(wrapper.find('link-role-dropdown-stub').exists()).toBeTruthy()
      expect(wrapper.find('.edit-drop-trigger').exists()).toBeTruthy()
    })

    it.todo('test edit options, button clicks and event handling/propagation')
  })

  describe('editOptions computed property', () => {
    it('does not add "add-expiration" option if isAliasLink is true', () => {
      const exampleLinkInternal = { ...exampleLink }
      exampleLinkInternal.type = SharingLinkType.Internal
      const { wrapper } = getShallowMountedWrapper(exampleLinkInternal, false, true)
      expect(wrapper.vm.editOptions.some((option) => option.id === 'add-expiration')).toBe(false)
    })

    it('adds "add-expiration" option if isAliasLink is false', () => {
      const { wrapper } = getShallowMountedWrapper(exampleLink, false, true)
      expect(wrapper.vm.editOptions.some((option) => option.id === 'add-expiration')).toBe(true)
    })
  })
})

function getShallowMountedWrapper(
  linkShare: LinkShare,
  expireDateEnforced = false,
  isModifiable = false
) {
  vi.mocked(useLinkTypes).mockReturnValue(
    mock<ReturnType<typeof useLinkTypes>>({
      getAvailableLinkTypes: () => [SharingLinkType.View],
      getLinkRoleByType: () => mock<ShareRole>({ displayName: '', description: '', label: '' })
    })
  )

  const mocks = defaultComponentMocks()
  return {
    wrapper: shallowMount(DetailsAndEdit, {
      props: {
        canRename: true,
        expirationRules: {
          enforced: expireDateEnforced,
          default: null,
          min: 'Wed Apr 01 2020 00:00:00 GMT+0000 (Coordinated Universal Time)',
          max: null
        },
        linkShare,
        isModifiable,
        isPasswordEnforced: false
      },
      global: {
        mocks,
        renderStubDefaultSlot: true,
        stubs: { OcDatepicker: false, 'date-picker': true },
        plugins: [...defaultPlugins()],
        provide: mocks
      }
    })
  }
}

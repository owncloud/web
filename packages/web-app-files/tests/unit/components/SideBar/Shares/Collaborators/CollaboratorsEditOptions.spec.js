import { mount, createLocalVue } from '@vue/test-utils'
import DesignSystem from 'owncloud-design-system'
import Vuex from 'vuex'

import EditOptions from '@files/src/components/SideBar/Shares/Collaborators/CollaboratorsEditOptions.vue'

const localVue = createLocalVue()
localVue.use(DesignSystem)
localVue.use(Vuex)

describe('CollaboratorsEditOptions component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('opens custom permissions drop when custom permissions item in the roles is selected', async () => {
    const wrapper = getWrapper()
    const permissionsDrop = wrapper.find('[data-testid="files-recipient-custom-permissions-drop"]')

    permissionsDrop.vm.show = jest.fn()

    await wrapper
      .find('[data-testid="files-recipient-role-drop-btn-advancedRole"]')
      .trigger('click')

    expect(permissionsDrop.vm.show).toHaveBeenCalled()
  })

  it('closes custom permissions drop when they are confirmed', async () => {
    const wrapper = getWrapper()
    const permissionsDrop = wrapper.find('[data-testid="files-recipient-custom-permissions-drop"]')

    permissionsDrop.vm.hide = jest.fn()

    await wrapper
      .find('[data-testid="files-recipient-custom-permissions-drop-confirm"]')
      .trigger('click')

    expect(permissionsDrop.vm.hide).toHaveBeenCalled()
  })

  it('opens role drop when custom permissions drop is cancelled', async () => {
    const wrapper = getWrapper()
    const rolesDrop = wrapper.find('[data-testid="files-recipient-roles-drop"]')
    const permissionsDrop = wrapper.find('[data-testid="files-recipient-custom-permissions-drop"]')

    rolesDrop.vm.show = jest.fn()
    permissionsDrop.vm.hide = jest.fn()

    await wrapper
      .find('[data-testid="files-recipient-custom-permissions-drop-cancel"]')
      .trigger('click')

    expect(permissionsDrop.vm.hide).toHaveBeenCalled()
    expect(rolesDrop.vm.show).toHaveBeenCalled()
  })

  it.each(['update', 'create', 'delete', 'share'])(
    'displays custom permission %s in the custom permissions drop',
    permission => {
      const wrapper = getWrapper()

      expect(
        wrapper.find(`[data-testid="files-collaborators-permission-${permission}"]`).exists()
      ).toBeTruthy()
    }
  )
})

function getWrapper() {
  return mount(EditOptions, {
    localVue,
    store: new Vuex.Store({
      getters: {
        capabilities: () => ({
          files_sharing: { user: { expire_date: null } }
        }),
        isOcis: () => false
      },
      modules: {
        Files: {
          namespaced: true,
          getters: {
            highlightedFile: () => ({ type: 'folder' })
          }
        }
      }
    }),
    stubs: { translate: true }
  })
}

import LinkActions from '@files/src/components/SideBar/Links/PublicLinks/LinkActions.vue'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import GetTextPlugin from 'vue-gettext'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'

const localVue = createLocalVue()
localVue.use(DesignSystem)
localVue.use(Vuex)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const storeOptions = {
  modules: {
    Files: {
      namespaced: true,
      actions: {
        removeLink: jest.fn()
      },
      mutations: {
        TRIGGER_PUBLIC_LINK_EDIT: jest.fn()
      }
    }
  },
  actions: {
    showMessage: jest.fn(),
    createModal: jest.fn(),
    hideModal: jest.fn()
  }
}

const selectors = {
  editActionButton: '.oc-files-file-link-edit',
  deleteActionButton: '.oc-files-file-link-delete'
}

describe('LinkActions', () => {
  describe('removal in progress', () => {
    it('should render spinner if true', async () => {
      const wrapper = getShallowMountedWrapper()
      await wrapper.setData({ removalInProgress: true })
      const spinner = wrapper.find('oc-spinner-stub')

      expect(spinner.exists()).toBeTruthy()
      expect(spinner.attributes('aria-label')).toBe('Removing public link')

      const actionLinks = wrapper.findAll('oc-button-stub')
      expect(actionLinks.length).toBe(0)
    })

    it('should not render spinner if false', async () => {
      const wrapper = getShallowMountedWrapper()
      await wrapper.setData({ removalInProgress: false })
      const spinner = wrapper.find('oc-spinner-stub')
      expect(spinner.exists()).toBeFalsy()

      const actionLinks = wrapper.findAll('oc-button-stub')
      expect(actionLinks.length).toBe(2)
    })
  })

  describe('action buttons label', () => {
    it('should set edit link button label', () => {
      const wrapper = getShallowMountedWrapper()
      const editLinkButton = wrapper.find(selectors.editActionButton)

      expect(editLinkButton.attributes('aria-label')).toBe('Edit public link')
    })

    it('should set remove link button label', () => {
      const wrapper = getShallowMountedWrapper()
      const editLinkButton = wrapper.find(selectors.deleteActionButton)

      expect(editLinkButton.attributes('aria-label')).toBe('Delete public link')
    })
  })

  describe('link buttons function calls', () => {
    const editLinkSpy = jest.spyOn(LinkActions.methods, 'editLink')
    const removeLinkSpy = jest.spyOn(LinkActions.methods, '$_removeLink')
    const triggerPublicLinkEditSpy = jest.spyOn(
      storeOptions.modules.Files.mutations,
      'TRIGGER_PUBLIC_LINK_EDIT'
    )
    const wrapper = getMountedWrapper()

    it('should call "editLink" if edit link button is clicked', async () => {
      const wrapper = getMountedWrapper()
      const editButton = wrapper.find(selectors.editActionButton)
      await editButton.trigger('click')

      expect(editLinkSpy).toHaveBeenCalledTimes(1)
      expect(triggerPublicLinkEditSpy).toHaveBeenCalledTimes(1)
    })

    it('should call "$_removeLink" if delete link button is clicked', async () => {
      const deleteButton = wrapper.find(selectors.deleteActionButton)
      await deleteButton.trigger('click')

      expect(removeLinkSpy).toHaveBeenCalledTimes(1)
    })
  })
})

function getMountedWrapper() {
  return mount(LinkActions, {
    localVue,
    propsData: {
      link: {}
    },
    provide: {
      changeView: jest.fn()
    },
    store: createStore(),
    stubs: {
      'oc-button': false,
      'oc-icon': true,
      'oc-spinner': true
    }
  })
}

function getShallowMountedWrapper() {
  return shallowMount(LinkActions, {
    propsData: {
      link: {}
    },
    store: createStore(),
    provide: {
      changeView: jest.fn()
    },
    directives: {
      'oc-tooltip': jest.fn()
    },
    stubs: {
      'oc-button': true,
      'oc-icon': true,
      'oc-spinner': true
    }
  })
}

function createStore() {
  return new Vuex.Store(storeOptions)
}

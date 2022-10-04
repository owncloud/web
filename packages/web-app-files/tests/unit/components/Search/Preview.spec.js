import { shallowMount, createLocalVue } from '@vue/test-utils'
import DesignSystem from 'owncloud-design-system'

import Preview from '@files/src/components/Search/Preview.vue'
import VueCompositionAPI from '@vue/composition-api'
import { createStore } from 'vuex-extensions'
import Vuex from 'vuex'

const localVue = createLocalVue()
localVue.use(DesignSystem)
localVue.use(VueCompositionAPI)
localVue.use(Vuex)

describe('Preview component', () => {
  it('should set correct props on oc-resource component', () => {
    const wrapper = getWrapper()
    const ocResource = wrapper.find('oc-resource-stub')

    expect(ocResource.exists()).toBeTruthy()
    expect(ocResource.props().resource).toMatchObject(wrapper.vm.searchResult.data)
  })
  describe('computed folderLink and parentFolderLink', () => {
    it('should be empty if no resource target location given', () => {
      const wrapper = getWrapper({ resourceTargetLocation: null })
      expect(wrapper.vm.folderLink).toEqual({})
      expect(wrapper.vm.parentFolderLink).toEqual({})
    })
    it('should use the items storageId for the resource target location if present', () => {
      const wrapper = getWrapper({ resourceTargetLocation: { name: 'some-route' } })
      expect(wrapper.vm.folderLink.params.storageId).toEqual('1')
      expect(wrapper.vm.parentFolderLink.params.storageId).toEqual('1')
    })
  })

  describe('computed method "defaultParentFolderName"', () => {
    it('should equal "All files and folders" if spaces capability is not present', () => {
      const wrapper = getWrapper({
        resourceTargetLocation: null,
        hasShareJail: false
      })
      expect(wrapper.vm.defaultParentFolderName).toEqual('All files and folders')
    })
    it('should equal the space name if resource storage is representing a project space', () => {
      const wrapper = getWrapper({
        resourceTargetLocation: null,
        spaces: [
          {
            id: '1',
            driveType: 'project',
            name: 'New space'
          }
        ]
      })
      expect(wrapper.vm.defaultParentFolderName).toEqual('New space')
    })
    it('should equal the share name if resource is representing a file or folder in the root of a share', () => {
      const wrapper = getWrapper({
        searchResult: {
          id: '1',
          data: {
            path: '/1/My share',
            shareRoot: '/My share',
            shareId: '1'
          }
        }
      })
      expect(wrapper.vm.defaultParentFolderName).toEqual('My share')
    })
    it('should equal the "Shared with me" if resource is representing the root share', () => {
      const wrapper = getWrapper({
        searchResult: {
          id: '1',
          data: {
            path: '/',
            shareRoot: '/My share',
            shareId: '1'
          }
        }
      })
      expect(wrapper.vm.defaultParentFolderName).toEqual('Shared with me')
    })
    it('should equal "Personal" if resource storage is not representing the personal home', () => {
      const wrapper = getWrapper({
        resourceTargetLocation: null,
        spaces: [
          {
            id: 1,
            driveType: 'personal'
          }
        ]
      })
      expect(wrapper.vm.defaultParentFolderName).toEqual('Personal')
    })
  })
})

function getWrapper({
  resourceTargetLocation = {},
  route = {
    query: {},
    params: {}
  },
  spaces = [],
  hasShareJail = true,
  searchResult = {
    id: '1',
    data: {
      storageId: '1',
      name: 'lorem.txt',
      path: '/'
    }
  },
  user = { id: 'test' }
} = {}) {
  return shallowMount(Preview, {
    localVue,
    store: createStore(Vuex.Store, {
      getters: {
        configuration: () => ({
          options: {
            disablePreviews: true
          }
        }),
        user: () => user
      },
      modules: {
        runtime: {
          namespaced: true,
          modules: {
            spaces: {
              namespaced: true,
              state: {
                spaces
              }
            }
          }
        }
      }
    }),
    mocks: {
      $route: route,
      $gettext: (text) => text
    },
    propsData: {
      searchResult
    },
    stubs: {
      'oc-progress': true,
      'oc-resource': true
    },
    setup: () => {
      return {
        resourceTargetLocation,
        hasShareJail
      }
    }
  })
}

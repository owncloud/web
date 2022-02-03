import merge from 'lodash-es/merge'
import { mount, createLocalVue } from '@vue/test-utils'
import { DateTime } from 'luxon'
import DesignSystem from 'owncloud-design-system'
import VueCompositionAPI from '@vue/composition-api'
import ResourceTable from '../../../../src/components/FilesList/ResourceTable.vue'
import { createStore } from 'vuex-extensions'
import Vuex from 'vuex'

const getCurrentDate = () => {
  return DateTime.fromJSDate(new Date()).minus({ days: 1 }).toFormat('EEE, dd MMM yyyy HH:mm:ss')
}

const fields = ['name', 'size', 'mdate', 'sdate', 'ddate', 'actions', 'owner', 'sharedWith']

const sharedWith = [
  {
    id: 'bob',
    username: 'bob',
    displayName: 'Bob',
    avatar:
      'https://images.unsplash.com/photo-1610216705422-caa3fcb6d158?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MTB8fGZhY2V8ZW58MHwyfDB8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
  },
  {
    id: 'marie',
    username: 'marie',
    displayName: 'Marie',
    avatar:
      'https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?ixid=MXwxMjA3fDB8MHxzZWFyY2h8Mzh8fGZhY2V8ZW58MHwyfDB8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
  },
  {
    id: 'john',
    username: 'john',
    displayName: 'John Richards Emperor of long names'
  }
]

const owner = [
  {
    id: 'bob',
    username: 'bob',
    displayName: 'Bob',
    avatar:
      'https://images.unsplash.com/photo-1610216705422-caa3fcb6d158?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MTB8fGZhY2V8ZW58MHwyfDB8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
  }
]

const indicators = [
  {
    id: 'files-sharing',
    label: 'Shared with other people',
    visible: true,
    icon: 'group',
    handler: (resource, indicatorId) =>
      alert(`Resource: ${resource.name}, indicator: ${indicatorId}`)
  },
  {
    id: 'file-link',
    label: 'Shared via link',
    visible: true,
    icon: 'link'
  }
]

const resourcesWithAllFields = [
  {
    id: 'forest',
    name: 'forest.jpg',
    path: 'images/nature/forest.jpg',
    extension: 'jpg',
    thumbnail: 'https://cdn.pixabay.com/photo/2015/09/09/16/05/forest-931706_960_720.jpg',
    indicators,
    isFolder: false,
    type: 'file',
    size: '111000234',
    mdate: getCurrentDate(),
    sdate: getCurrentDate(),
    ddate: getCurrentDate(),
    owner,
    sharedWith
  },
  {
    id: 'notes',
    name: 'notes.txt',
    path: '/Documents/notes.txt',
    extension: 'txt',
    indicators,
    isFolder: false,
    type: 'file',
    size: 'big',
    mdate: getCurrentDate(),
    sdate: getCurrentDate(),
    ddate: getCurrentDate(),
    sharedWith,
    owner
  },
  {
    id: 'documents',
    name: 'Documents',
    path: '/Documents',
    indicators,
    isFolder: true,
    type: 'folder',
    size: '-1',
    mdate: getCurrentDate(),
    sdate: getCurrentDate(),
    ddate: getCurrentDate(),
    sharedWith,
    owner
  },
  {
    id: 'another-one==',
    name: 'Another one',
    path: '/Another one',
    indicators,
    isFolder: true,
    type: 'folder',
    size: '237895',
    mdate: getCurrentDate(),
    sdate: getCurrentDate(),
    ddate: getCurrentDate(),
    sharedWith,
    owner
  }
]

describe('ResourceTable', () => {
  const spyDisplayPositionedDropdown = jest
    .spyOn(ResourceTable.methods, 'displayPositionedDropdown')
    .mockImplementation()

  let wrapper

  beforeEach(() => {
    wrapper = getMountedWrapper()
    jest.clearAllMocks()
  })

  it('displays all known fields of the resources', () => {
    for (const field of fields) {
      expect(wrapper.findAll('.oc-table-header-cell-' + field).length).toEqual(1)
      expect(wrapper.findAll('.oc-table-data-cell-' + field).length).toEqual(
        resourcesWithAllFields.length
      )
    }
  })

  it('accepts resourceDomId closure', () => {
    const wrapper = getMountedWrapper({
      propsData: {
        resourceDomSelector: (resource) => ['custom', resource.id.replace(/=+/, '')].join('-')
      }
    })
    resourcesWithAllFields.forEach((resource) => {
      ;['.oc-tbody-tr', '#resource-table-select', '#context-menu-drop'].forEach((baseSelector) => {
        expect(
          wrapper.find([baseSelector, 'custom', resource.id.replace(/=+/, '')].join('-')).exists()
        ).toBeTruthy()
      })
    })
  })

  it('formats the resource size to a human readable format', () => {
    expect(wrapper.find('.oc-tbody-tr-forest .oc-table-data-cell-size').text()).toEqual('111 MB')
    expect(wrapper.find('.oc-tbody-tr-documents .oc-table-data-cell-size').text()).toEqual('--')
    expect(wrapper.find('.oc-tbody-tr-notes .oc-table-data-cell-size').text()).toEqual('?')
  })

  describe('resource selection', () => {
    it('adds resources to selection model via checkboxes', () => {
      wrapper.find('.resource-table-select-all .oc-checkbox').setChecked()
      wrapper.find('.oc-tbody-tr-documents .oc-checkbox').setChecked()
      expect(wrapper.emitted().select.length).toBe(2)
    })

    describe('all rows already selected', () => {
      it('de-selects all resources via the select-all checkbox', async () => {
        const wrapperSelected = getMountedWrapper({
          propsData: {
            selection: resourcesWithAllFields.map((resource) => resource.id)
          }
        })

        await wrapperSelected.find('.resource-table-select-all .oc-checkbox').setChecked(false)
        expect(wrapperSelected.emitted().select[0][0].length).toBe(0)
      })
    })
  })

  describe('resource activation', () => {
    it('emits fileClick upon clicking on a resource name', () => {
      wrapper.find('.oc-tbody-tr-forest .oc-resource-name').trigger('click')

      expect(wrapper.emitted().fileClick[0][0].name).toMatch('forest.jpg')
    })
  })

  describe('resource details', () => {
    it('emits select event when clicking on the row', async () => {
      const tableRow = await wrapper.find('.oc-tbody-tr .oc-table-data-cell-size')
      await tableRow.trigger('click')
      expect(wrapper.emitted().select).toBeTruthy()
    })
  })

  describe('context menu', () => {
    it('emits select event on contextmenu click', async () => {
      await wrapper.find('.oc-tbody-tr').trigger('contextmenu')
      expect(wrapper.emitted().select.length).toBe(1)
      expect(spyDisplayPositionedDropdown).toHaveBeenCalledTimes(1)
    })

    it('emits select event on clicking the three-dot icon in table row', async () => {
      await wrapper
        .find('.oc-table-data-cell-actions .resource-table-btn-action-dropdown')
        .trigger('click')
      expect(wrapper.emitted().select.length).toBe(1)
      expect(spyDisplayPositionedDropdown).toHaveBeenCalledTimes(1)
    })

    it('removes invalid chars from item ids for usage in html template', async () => {
      const contextMenuTriggers = await wrapper.findAll('.resource-table-btn-action-dropdown')
      for (let i = 0; i < contextMenuTriggers.length; i++) {
        const id = contextMenuTriggers.at(i).attributes().id
        expect(id).not.toBeUndefined()
        expect(id).toEqual(expect.not.stringContaining('='))
      }
    })
  })

  describe('hover effect', () => {
    it('is disabled by default', () => {
      const wrapper = getMountedWrapper({ propsData: { hover: false } })
      expect(wrapper.classes()).not.toContain('oc-table-hover')
    })

    it('can be enabled', () => {
      const wrapper = getMountedWrapper({ propsData: { hover: true } })
      expect(wrapper.classes()).toContain('oc-table-hover')
    })
  })
})

function getMountedWrapper(options = {}) {
  const localVue = createLocalVue()
  localVue.use(DesignSystem)
  localVue.use(Vuex)
  localVue.use(VueCompositionAPI)
  localVue.prototype.$gettextInterpolate = jest.fn()
  localVue.prototype.$ngettext = jest.fn()

  return mount(
    ResourceTable,
    merge(
      {
        store: createStore(Vuex.Store, {
          getters: {
            configuration: () => {}
          }
        }),
        propsData: {
          resources: resourcesWithAllFields,
          selection: [],
          slots: {
            status: "<div class='status-slot'>Hello world!</div>"
          },
          hover: false
        },
        stubs: {
          'router-link': true
        },
        localVue
      },
      options
    )
  )
}

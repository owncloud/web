import { mount, shallowMount } from 'web-test-helpers'
import { axe, toHaveNoViolations } from 'jest-axe'
import Table from './CollapsibleOcTable.vue'

expect.extend(toHaveNoViolations)

const fields = [
  {
    name: 'id',
    title: 'Id'
  },
  {
    name: 'resource',
    title: 'Resource',
    headerType: 'slot',
    type: 'slot'
  },
  {
    name: 'doubled',
    title: 'Doubled',
    type: 'callback',
    callback: function (value) {
      return `Double of ${value} is ${value * 2}`
    }
  },
  {
    name: 'name',
    title: 'Name'
  }
]

const data = [
  {
    id: '4b136c0a-5057-11eb-ac70-eba264112003',
    resource: 'hello-world.txt',
    icon: 'text',
    doubled: 2,
    name: 'hello-world.txt'
  },
  {
    id: '8468c9f0-5057-11eb-924b-934c6fd827a2',
    resource: 'I am a folder',
    icon: 'folder',
    doubled: 6,
    name: 'I am a folder'
  },
  {
    id: '9c4cf97e-5057-11eb-8044-b3d5df9caa21',
    resource: 'this is fine.png',
    icon: 'image',
    doubled: 12,
    name: 'this is fine.png'
  },
  {
    id: '9c4cf97e-5057-11eb-8044-b3d5df9caa22',
    resource: 'this is fine2.png',
    icon: 'image',
    doubled: 12,
    name: 'this is fine2.png'
  }
]

const groupingSettings = {
  groupingBy: 'Name alphabetically',
  showGroupingOptions: true,
  groupingFunctions: {
    'Name alphabetically': function (row) {
      if (!isNaN(row.name.charAt(0))) {
        return '#'
      }
      if (row.name.charAt(0) === '.') {
        return row.name.charAt(1).toLowerCase()
      }
      return row.name.charAt(0).toLowerCase()
    },
    None: function () {
      localStorage.setItem('grouping-shared-with-me', 'None')
    }
  },
  sortGroups: {
    'Name alphabetically': function (groups) {
      // sort in alphabetical order by group name
      const sortedGroups = groups.sort(function (a, b) {
        if (a.name < b.name) {
          return -1
        }
        if (a.name > b.name) {
          return 1
        }
        return 0
      })
      // if sorting is done by name, reverse groups depending on asc/desc
      // if (that.sharesSortBy === 'name' && that.sharesSortDir === 'desc') {
      //   sortedGroups.reverse()
      // }
      return sortedGroups
    }
  }
}

const groupingSettingsNone = {
  groupingBy: 'None',
  showGroupingOptions: true
}

describe('CollapsibleOcTable', () => {
  
  it('has grouping settings set', () => {
    const wrapper = mount(Table, {
      propsData: {
        fields,
        data,
        groupingSettings
      }
    })

    expect(wrapper.find('.oc-docs-width-small').exists()).toBe(true)
    expect(wrapper.vm.groupingAllowed).toBe(true)
    expect(wrapper.vm.groupedData.length).toBe(3)
    expect(groupingSettings.groupingBy).toBe('Name alphabetically')
    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.findAll('.oc-tbody-tr-accordion').length).toBe(3)
  })

  it('highlights a row', () => {
    const wrapper = shallowMount(Table, {
      props: {
        fields,
        data,
        groupingSettings,
        highlighted: '4b136c0a-5057-11eb-ac70-eba264112003'
      },
      global: { renderStubDefaultSlot: true }
    })

    expect(wrapper.findAll('.oc-table-highlighted').length).toEqual(1)
  })

  it('enable dragDrop should enable draggable on rows', () => {
    const wrapper = shallowMount(Table, {
      props: {
        fields,
        data,
        groupingSettings,
        highlighted: [],
        dragDrop: true
      },
      global: { renderStubDefaultSlot: true }
    })
    expect(wrapper.html().indexOf('draggable')).toBeGreaterThan(-1)
  })

  it('adds data-item-id for rows', () => {
    const wrapper = shallowMount(Table, {
      props: {
        fields,
        data,
        groupingSettings,
        highlighted: []
      },
      global: { renderStubDefaultSlot: true }
    })
    expect(wrapper.html().indexOf('data-item-id')).toBeGreaterThan(-1)
  })

  it('accepts itemDomSelector closure', () => {
    const wrapper = shallowMount(Table, {
      props: {
        fields,
        data,
        groupingSettings,
        highlighted: [],
        itemDomSelector: (item) => ['custom', item.id].join('-')
      },
      global: { renderStubDefaultSlot: true }
    })
    data.forEach((item) => {
      expect(wrapper.find(['.oc-tbody-tr-custom', item.id].join('-')).exists()).toBeTruthy()
    })
  })

  // No grouping setting

  it('displays all field types  with grouping settings set to None', async () => {
    const wrapper = mount(Table, {
      props: {
        fields,
        groupingSettingsNone,
        data
      },
      slots: {
        resourceHeader: '<span class="slot-header">Hello world!</span>',
        resource: `
        <div class="slot">
          <span>
            Hello world!
          </span>
        </div>
        `
      }
    })

    expect(wrapper.html().indexOf('4b136c0a-5057-11eb-ac70-eba264112003')).toBeGreaterThan(-1)
    expect(wrapper.html().indexOf('Double of 2 is 4')).toBeGreaterThan(-1)
    expect(wrapper.findAll('.slot').length).toBe(data.length)
    expect(wrapper.findAll('.slot-header').length).toBe(1)

    // A11y tests
    expect(
      await axe(wrapper.html(), {
        rules: {
          region: { enabled: false }
        }
      })
    ).toHaveNoViolations()
  })

  it('enable dragDrop should enable draggable on rows with grouping settings set to None', () => {
    const wrapper = shallowMount(Table, {
      props: {
        fields,
        data,
        groupingSettingsNone,
        highlighted: [],
        dragDrop: true
      },
      global: { renderStubDefaultSlot: true }
    })
    expect(wrapper.html().indexOf('draggable')).toBeGreaterThan(-1)
  })

  it('adds data-item-id for rows  with grouping settings set to None', () => {
    const wrapper = shallowMount(Table, {
      props: {
        fields,
        data,
        groupingSettingsNone,
        highlighted: []
      },
      global: { renderStubDefaultSlot: true }
    })
    expect(wrapper.html().indexOf('data-item-id')).toBeGreaterThan(-1)
  })

  it('enable dragDrop should enable draggable on rows  with grouping settings set to None', () => {
    const wrapper = shallowMount(Table, {
      props: {
        fields,
        data,
        groupingSettingsNone,
        highlighted: [],
        dragDrop: true
      },
      global: { renderStubDefaultSlot: true }
    })
    expect(wrapper.html().indexOf('draggable')).toBeGreaterThan(-1)
  })

})

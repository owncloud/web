import { mount, createLocalVue } from '@vue/test-utils'
import DesignSystem from 'owncloud-design-system'
import ResourceTable from '../../../../src/components/FilesList/ResourceTable.vue'

const ASC = 'ascending'
const DESC = 'descending'
const NONE = 'none'

const sharedWithOne = [
  {
    id: 'bob',
    username: 'bob',
    displayName: 'Bob'
  }
]

const sharedWithTwo = [
  {
    id: 'marie',
    username: 'marie',
    displayName: 'Marie'
  },
  {
    id: 'john',
    username: 'john',
    displayName: 'John Richards Emperor of long names'
  }
]

const sharedWithThree = [
  {
    id: 'bob',
    username: 'bob',
    displayName: 'Bob'
  },
  {
    id: 'marie',
    username: 'marie',
    displayName: 'Marie'
  },
  {
    id: 'john',
    username: 'john',
    displayName: 'John Richards Emperor of long names'
  }
]

const firstOwner = sharedWithOne
const secondOwner = []
secondOwner[0] = sharedWithTwo[0]

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
    thumbnail: 'https://cdn.pixabay.com/photo/2015/09/09/16/05/forest-931706_960_720.jpg',
    indicators,
    type: 'file',
    size: '111000234',
    mdate: 'Thu, 01 Jul 2021 08:34:04 GMT',
    owner: firstOwner,
    sharedWith: sharedWithOne
  },
  {
    id: 'notes',
    name: 'notes.txt',
    path: '/Documents/notes.txt',
    icon: 'text',
    indicators,
    type: 'file',
    size: '1245',
    mdate: 'Thu, 01 Jul 2021 08:45:04 GMT',
    owner: secondOwner,
    sharedWith: sharedWithTwo
  },
  {
    id: 'documents',
    name: 'Documents',
    path: '/Documents',
    icon: 'folder',
    indicators,
    type: 'folder',
    size: '5324435',
    mdate: 'Sat, 09 Jan 2021 14:34:04 GMT',
    owner: firstOwner,
    sharedWith: sharedWithThree
  },
  {
    id: 'pdfs',
    name: 'pdfs',
    path: '/pdfs',
    icon: 'folder',
    indicators,
    type: 'folder',
    size: '53244',
    mdate: 'Sat, 09 Jan 2021 14:34:04 GMT',
    owner: firstOwner,
    sharedWith: sharedWithThree
  },
  {
    id: 'Prints',
    name: 'Prints',
    path: '/Prints',
    icon: 'folder',
    indicators,
    type: 'folder',
    size: '53244',
    mdate: 'Sat, 09 Jan 2021 14:34:04 GMT',
    owner: firstOwner,
    sharedWith: sharedWithThree
  }
]

describe('ResourceTable.sort', () => {
  function getWrapperWithProps(props = {}) {
    const localVue = createLocalVue()
    localVue.use(DesignSystem)
    localVue.prototype.$gettextInterpolate = jest.fn()
    localVue.prototype.$ngettext = jest.fn()

    return mount(ResourceTable, {
      propsData: {
        resources: resourcesWithAllFields,
        ...props
      },
      localVue,
      stubs: {
        'router-link': true
      }
    })
  }

  function getHeaders(wrapper) {
    return wrapper.findAll('thead th')
  }

  function getSortByName(wrapper) {
    return getHeaders(wrapper).at(1)
  }

  function getSortBySize(wrapper) {
    return getHeaders(wrapper).at(2)
  }

  function getSortBySharedWith(wrapper) {
    return getHeaders(wrapper).at(3)
  }

  function getSortByOwner(wrapper) {
    return getHeaders(wrapper).at(4)
  }

  function getSortByMdate(wrapper) {
    return getHeaders(wrapper).at(5)
  }

  it('renders all sorting table headers correctly', () => {
    expect(getWrapperWithProps().findAll('[aria-sort]').length).toBe(5)
  })

  it('displays all fields in order of first sortable field', () => {
    const resources = getWrapperWithProps().findAll('.oc-resource-name')

    expect(resources.at(0).attributes('data-test-resource-name')).toBe('Documents')
    expect(resources.at(1).attributes('data-test-resource-name')).toBe('pdfs')
    expect(resources.at(2).attributes('data-test-resource-name')).toBe('Prints')
    expect(resources.at(3).attributes('data-test-resource-name')).toBe('forest.jpg')
    expect(resources.at(4).attributes('data-test-resource-name')).toBe('notes.txt')
  })

  it('sorts by name on click', async () => {
    const wrapper = getWrapperWithProps()
    const sortByName = getSortByName(wrapper)
    const sortBySize = getSortBySize(wrapper)

    await sortByName.trigger('click')

    expect(sortByName.attributes('aria-sort')).toBe(ASC)
    expect(sortBySize.attributes('aria-sort')).toBe(NONE)

    const resourcesOne = wrapper.findAll('.oc-resource-name')

    expect(resourcesOne.at(0).attributes('data-test-resource-name')).toBe('notes.txt')
    expect(resourcesOne.at(1).attributes('data-test-resource-name')).toBe('forest.jpg')
    expect(resourcesOne.at(2).attributes('data-test-resource-name')).toBe('Prints')
    expect(resourcesOne.at(3).attributes('data-test-resource-name')).toBe('pdfs')
    expect(resourcesOne.at(4).attributes('data-test-resource-name')).toBe('Documents')

    await sortByName.trigger('click')

    expect(sortByName.attributes('aria-sort')).toBe(DESC)

    const resourcesTwo = wrapper.findAll('.oc-resource-name')

    expect(resourcesTwo.at(0).attributes('data-test-resource-name')).toBe('Documents')
    expect(resourcesTwo.at(1).attributes('data-test-resource-name')).toBe('pdfs')
    expect(resourcesTwo.at(2).attributes('data-test-resource-name')).toBe('Prints')
    expect(resourcesTwo.at(3).attributes('data-test-resource-name')).toBe('forest.jpg')
    expect(resourcesTwo.at(4).attributes('data-test-resource-name')).toBe('notes.txt')
  })

  it('sorts by size', async () => {
    const wrapper = getWrapperWithProps()
    const sortByName = getSortByName(wrapper)
    const sortBySize = getSortBySize(wrapper)

    await sortBySize.trigger('click')

    expect(sortByName.attributes('aria-sort')).toBe(NONE)
    expect(sortBySize.attributes('aria-sort')).toBe(DESC)

    const resourcesOne = wrapper.findAll('.oc-resource-name')

    expect(resourcesOne.at(0).attributes('data-test-resource-name')).toBe('notes.txt')
    expect(resourcesOne.at(1).attributes('data-test-resource-name')).toBe('pdfs')
    expect(resourcesOne.at(2).attributes('data-test-resource-name')).toBe('Prints')
    expect(resourcesOne.at(3).attributes('data-test-resource-name')).toBe('Documents')
    expect(resourcesOne.at(4).attributes('data-test-resource-name')).toBe('forest.jpg')

    await sortBySize.trigger('click')

    expect(sortBySize.attributes('aria-sort')).toBe(ASC)

    const resourcesTwo = wrapper.findAll('.oc-resource-name')

    expect(resourcesTwo.at(0).attributes('data-test-resource-name')).toBe('forest.jpg')
    expect(resourcesTwo.at(1).attributes('data-test-resource-name')).toBe('Documents')
    expect(resourcesTwo.at(2).attributes('data-test-resource-name')).toBe('pdfs')
    expect(resourcesTwo.at(3).attributes('data-test-resource-name')).toBe('Prints')
    expect(resourcesTwo.at(4).attributes('data-test-resource-name')).toBe('notes.txt')
  })

  it('sorts by modification date', async () => {
    const wrapper = getWrapperWithProps()
    const sortByMdate = getSortByMdate(wrapper)
    const sortBySize = getSortBySize(wrapper)

    await sortByMdate.trigger('click')

    expect(sortByMdate.attributes('aria-sort')).toBe(DESC)
    expect(sortBySize.attributes('aria-sort')).toBe(NONE)

    const resourcesOne = wrapper.findAll('.oc-resource-name')

    expect(resourcesOne.at(0).attributes('data-test-resource-name')).toBe('Documents')
    expect(resourcesOne.at(1).attributes('data-test-resource-name')).toBe('pdfs')
    expect(resourcesOne.at(2).attributes('data-test-resource-name')).toBe('Prints')
    expect(resourcesOne.at(3).attributes('data-test-resource-name')).toBe('forest.jpg')
    expect(resourcesOne.at(4).attributes('data-test-resource-name')).toBe('notes.txt')

    await sortByMdate.trigger('click')

    expect(sortByMdate.attributes('aria-sort')).toBe(ASC)

    const resourcesTwo = wrapper.findAll('.oc-resource-name')

    expect(resourcesTwo.at(0).attributes('data-test-resource-name')).toBe('notes.txt')
    expect(resourcesTwo.at(1).attributes('data-test-resource-name')).toBe('forest.jpg')
    expect(resourcesTwo.at(2).attributes('data-test-resource-name')).toBe('Documents')
  })

  it('sorts by owner', async () => {
    const wrapper = getWrapperWithProps()
    const sortByMdate = getSortByMdate(wrapper)
    const sortByOwner = getSortByOwner(wrapper)

    await sortByOwner.trigger('click')

    expect(sortByOwner.attributes('aria-sort')).toBe(DESC)
    expect(sortByMdate.attributes('aria-sort')).toBe(NONE)

    const resourcesOne = wrapper.findAll('.oc-resource-name')

    expect(resourcesOne.at(0).attributes('data-test-resource-name')).toBe('forest.jpg')
    expect(resourcesOne.at(1).attributes('data-test-resource-name')).toBe('Documents')
    expect(resourcesOne.at(2).attributes('data-test-resource-name')).toBe('pdfs')
    expect(resourcesOne.at(3).attributes('data-test-resource-name')).toBe('Prints')
    expect(resourcesOne.at(4).attributes('data-test-resource-name')).toBe('notes.txt')

    await sortByOwner.trigger('click')

    expect(sortByOwner.attributes('aria-sort')).toBe(ASC)

    const resourcesTwo = wrapper.findAll('.oc-resource-name')

    expect(resourcesTwo.at(0).attributes('data-test-resource-name')).toBe('notes.txt')
    expect(resourcesTwo.at(1).attributes('data-test-resource-name')).toBe('forest.jpg')
    expect(resourcesTwo.at(2).attributes('data-test-resource-name')).toBe('Documents')
    expect(resourcesTwo.at(3).attributes('data-test-resource-name')).toBe('pdfs')
    expect(resourcesTwo.at(4).attributes('data-test-resource-name')).toBe('Prints')
  })

  it('sorts by shares', async () => {
    const wrapper = getWrapperWithProps()
    const sortBySharedWith = getSortBySharedWith(wrapper)
    const sortByOwner = getSortByOwner(wrapper)

    await sortBySharedWith.trigger('click')

    expect(sortBySharedWith.attributes('aria-sort')).toBe(DESC)
    expect(sortByOwner.attributes('aria-sort')).toBe(NONE)

    const resourcesOne = wrapper.findAll('.oc-resource-name')

    expect(resourcesOne.at(0).attributes('data-test-resource-name')).toBe('forest.jpg')
    expect(resourcesOne.at(1).attributes('data-test-resource-name')).toBe('notes.txt')
    expect(resourcesOne.at(2).attributes('data-test-resource-name')).toBe('Documents')

    await sortBySharedWith.trigger('click')

    expect(sortBySharedWith.attributes('aria-sort')).toBe(ASC)

    const resourcesTwo = wrapper.findAll('.oc-resource-name')

    expect(resourcesTwo.at(0).attributes('data-test-resource-name')).toBe('Documents')
    expect(resourcesTwo.at(1).attributes('data-test-resource-name')).toBe('pdfs')
    expect(resourcesTwo.at(2).attributes('data-test-resource-name')).toBe('Prints')
    expect(resourcesTwo.at(3).attributes('data-test-resource-name')).toBe('notes.txt')
    expect(resourcesTwo.at(4).attributes('data-test-resource-name')).toBe('forest.jpg')
  })
})

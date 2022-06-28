import { shallowMount, createLocalVue } from '@vue/test-utils'
import GetTextPlugin from 'vue-gettext'

import stubs from '@/tests/unit/stubs'

import SpaceInfo from '@files/src/components/SideBar/SpaceInfo.vue'

const spaceMock = {
  type: 'space',
  name: ' space',
  id: '1',
  mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  spaceQuota: {
    used: 100
  }
}

const localVue = createLocalVue()
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const selectors = {
  name: '[data-testid="space-info-name"]',
  subtitle: '[data-testid="space-info-subtitle"]'
}

const formDateFromRFC = jest.fn()
const formRelativeDateFromRFC = jest.fn()
const resetDateMocks = () => {
  formDateFromRFC.mockReset()
  formRelativeDateFromRFC.mockReset()
  formDateFromRFC.mockImplementation(() => 'ABSOLUTE_TIME')
  formRelativeDateFromRFC.mockImplementation(() => 'RELATIVE_TIME')
}

describe('SpaceInfo', () => {
  it('shows space info', () => {
    resetDateMocks()

    const wrapper = createWrapper(spaceMock)
    expect(wrapper.find(selectors.name).exists()).toBeTruthy()
    expect(wrapper.find(selectors.subtitle).exists()).toBeTruthy()
    expect(wrapper).toMatchSnapshot()
  })
})

function createWrapper(spaceResource) {
  return shallowMount(SpaceInfo, {
    localVue,
    stubs: {
      ...stubs,
      'oc-resource-icon': true,
      'oc-resource-name': true
    },
    mixins: [
      {
        methods: {
          formDateFromRFC,
          formRelativeDateFromRFC
        }
      }
    ],
    provide: {
      displayedItem: {
        value: spaceResource
      }
    }
  })
}

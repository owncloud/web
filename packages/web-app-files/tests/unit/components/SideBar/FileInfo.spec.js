import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import GetTextPlugin from 'vue-gettext'
import AsyncComputed from 'vue-async-computed'

import stubs from '@/tests/unit/stubs'

import FileInfo from '@files/src/components/SideBar/FileInfo.vue'

const simpleOwnFile = {
  type: 'file',
  ownerId: 'marie',
  ownerDisplayName: 'Marie',
  mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  size: '740'
}

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(AsyncComputed)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const selectors = {
  name: '[data-testid="files-info-name"]',
  mdate: '[data-testid="files-info-mdate"]'
}

describe('FileInfo', () => {
  it('shows file info', () => {
    const tooltipStub = jest.fn()
    const wrapper = createWrapper(simpleOwnFile, tooltipStub)
    expect(wrapper.find(selectors.name).exists()).toBeTruthy()
    expect(wrapper.find(selectors.mdate).exists()).toBeTruthy()
  })

  it('shows modify date tooltip', () => {
    const tooltipStub = jest.fn()
    createWrapper(simpleOwnFile, tooltipStub)
    expect(tooltipStub).toHaveBeenCalledTimes(1)
  })
})

function createWrapper(testResource, tooltipStub) {
  return shallowMount(FileInfo, {
    store: new Vuex.Store({
      getters: {
        user: function () {
          return { id: 'marie' }
        },
        capabilities: jest.fn(() => ({}))
      },
      modules: {
        Files: {
          namespaced: true,
          getters: {
            highlightedFile: function () {
              return testResource
            }
          }
        }
      }
    }),
    localVue,
    stubs: stubs,
    directives: {
      OcTooltip: tooltipStub
    },
    mocks: {
      $route: {
        name: 'some-route',
        query: { page: 1 }
      },
      publicPage: () => false
    },
    provide: {
      displayedItem: {
        value: testResource
      }
    }
  })
}

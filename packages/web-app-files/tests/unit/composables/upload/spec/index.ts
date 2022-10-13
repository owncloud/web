import VueCompositionAPI, { defineComponent, SetupFunction, Data } from '@vue/composition-api'
import { createLocalVue, mount, Wrapper } from '@vue/test-utils'
import Vuex from 'vuex'
import Vue from 'vue'

const localVue = createLocalVue()
localVue.use(VueCompositionAPI)
localVue.use(Vuex)

const mockFile = {
  name: '',
  type: 'dir',
  fileInfo: {
    '{http://owncloud.org/ns}permissions': 'RDNVCK',
    '{http://owncloud.org/ns}favorite': '0',
    '{http://owncloud.org/ns}fileid': '3861',
    '{http://owncloud.org/ns}owner-id': 'alice',
    '{http://owncloud.org/ns}owner-display-name': 'alice',
    '{http://owncloud.org/ns}share-types': '',
    '{http://owncloud.org/ns}privatelink': 'http://host.docker.internal:8080/f/3861',
    '{http://owncloud.org/ns}size': '7546347',
    '{DAV:}getlastmodified': 'Mon, 14 Jun 2021 09:41:16 GMT',
    '{DAV:}getetag': '"60c7243c2e7f1"',
    '{DAV:}resourcetype': ['{DAV:}collection']
  },
  tusSupport: null
}

const store = new Vuex.Store({
  getters: {
    user: jest.fn(() => ({ id: 1 }))
  },
  modules: {
    Files: {
      namespaced: true,
      mutations: {
        UPSERT_RESOURCE: jest.fn()
      }
    }
  }
})

export const createWrapper = (
  setup: SetupFunction<Data, Data>,
  { currentItem = 'path', fileUrl = 'path' }: { currentItem: string; fileUrl: string }
): Wrapper<Vue> =>
  mount(
    defineComponent({
      setup,
      template: `<div></div>`
    }),
    {
      localVue,
      store,
      mocks: {
        $clientService: {
          owncloudSdk: {
            files: {
              getFileUrl: () => fileUrl,
              fileInfo: jest.fn().mockImplementation(() => Promise.resolve(mockFile))
            }
          }
        },
        $router: {
          resolve: (r) => {
            return {
              href: r.name
            }
          },
          afterEach: jest.fn(),
          currentRoute: {
            name: 'some-route',
            params: {
              item: currentItem
            }
          }
        }
      }
    }
  )

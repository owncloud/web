import VueCompositionAPI, { defineComponent, SetupFunction, Data } from '@vue/composition-api'
import { createLocalVue, mount, Wrapper } from '@vue/test-utils'
import Vuex from 'vuex'
import Vue from 'vue'

const localVue = createLocalVue()
localVue.use(VueCompositionAPI)
localVue.use(Vuex)

const store = new Vuex.Store({
  getters: {
    user: jest.fn(() => ({ id: 1 }))
  }
})

export const createWrapper = (
  setup: SetupFunction<Data, Data>,
  { currentItem = 'path', fileUrl = 'path' }: { currentItem: string; fileUrl: string }
): Wrapper<Vue> =>
  mount(
    defineComponent({
      template: `<div></div>`,
      setup
    }),
    {
      localVue,
      store,
      mocks: {
        $clientService: {
          owncloudSdk: {
            files: {
              getFileUrl: () => fileUrl
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

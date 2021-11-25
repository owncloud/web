import Vuex, { mapState } from 'vuex'
import Vue from 'vue'
import { mount, VueClass } from '@vue/test-utils'
import { localVue } from './views.setup'

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {}

// eslint-disable-next-line jest/no-export
export const accentuatesTableRowTest = async <V extends Vue>(
  vueClass: VueClass<V>
): Promise<void> => {
  jest.useFakeTimers()

  const store = new Vuex.Store({
    modules: {
      Files: {
        state: {
          activeFilesCurrentPage: [
            {
              id: 'forest',
              name: 'forest.jpg',
              path: 'images/nature/forest.jpg',
              thumbnail: 'https://cdn.pixabay.com/photo/2015/09/09/16/05/forest-931706_960_720.jpg',
              type: 'file',
              size: '111000234',
              mdate: 'Thu, 01 Jul 2021 08:34:04 GMT'
            }
          ]
        },
        mutations: {
          UPSERT_RESOURCE: (state, resource) => {
            state.activeFilesCurrentPage.push(resource)
          }
        },
        getters: {
          inProgress: () => 0
        },
        namespaced: true
      }
    }
  })
  const wrapper = mount(
    {
      ...vueClass,
      mixins: [],
      watch: {},
      mounted: noop,
      beforeDestroy: noop,
      computed: { ...mapState('Files', ['activeFilesCurrentPage']) }
    },
    {
      attachTo: document.body,
      localVue,
      store,
      stubs: {
        'list-loader': true,
        'not-found-message': true,
        'no-content-message': true,
        'quick-actions': true,
        'oc-resource': true,
        'context-actions': true,
        pagination: true,
        'list-info': true
      },
      computed: {
        folderNotFound: () => false,
        isEmpty: () => false,
        app: () => ({
          quickActions: {}
        }),
        totalFilesCount: () => ({
          files: 1,
          folders: 0
        })
      },
      mixins: [
        {
          methods: {
            $_fileActions_triggerDefaultAction: noop
          }
        }
      ]
    }
  )

  store.commit('Files/UPSERT_RESOURCE', {
    id: 'notes',
    name: 'notes.txt',
    path: '/Documents/notes.txt',
    icon: 'text',
    type: 'file',
    size: '1245',
    mdate: 'Thu, 01 Jul 2021 08:45:04 GMT'
  })

  await wrapper.vm.$nextTick()

  expect(wrapper.find("[data-item-id='notes']").classes()).toContain('oc-table-accentuated')

  jest.advanceTimersByTime(5000)

  expect(wrapper.find("[data-item-id='notes']").classes()).not.toContain('oc-table-accentuated')

  wrapper.destroy()
}

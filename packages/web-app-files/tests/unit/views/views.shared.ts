import Vue from 'vue'
import { mount, VueClass } from '@vue/test-utils'
import { localVue, getStore } from './views.setup'

const $route = {
  name: 'files-personal',
  params: { page: 1 }
}

const $router = {
  afterEach: jest.fn(),
  currentRoute: {
    query: {}
  }
}

const stubs = {
  'list-loader': true,
  'not-found-message': true,
  'no-content-message': true,
  'quick-actions': true,
  'oc-resource': true,
  'context-actions': true,
  pagination: true,
  'list-info': true
}

const forestJpg = {
  id: 'forest',
  name: 'forest.jpg',
  path: 'images/nature/forest.jpg',
  thumbnail: 'https://cdn.pixabay.com/photo/2015/09/09/16/05/forest-931706_960_720.jpg',
  type: 'file',
  size: '111000234',
  mdate: 'Thu, 01 Jul 2021 08:34:04 GMT'
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {}

// eslint-disable-next-line jest/no-export
export const accentuatesTableRowTest = async <V extends Vue>(
  vueClass: VueClass<V>
): Promise<void> => {
  jest.useFakeTimers()

  const store = getStore({
    inProgress: 0,
    activeFiles: [forestJpg],
    totalFilesSize: 0,
    totalFilesCount: {
      files: 1,
      folders: 0
    }
  })
  const wrapper = mount(
    {
      ...vueClass,
      mixins: [],
      watch: {},
      mounted: noop,
      beforeDestroy: noop
    },
    {
      attachTo: document.body,
      localVue,
      store,
      mocks: {
        $route,
        $router
      },
      stubs: stubs,
      computed: {
        displayThumbnails: () => false,
        folderNotFound: () => false,
        isEmpty: () => false
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

import { createStore as _createStore, StoreOptions } from 'vuex'
import { mount as _mount, MountingOptions } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'
import { defaultPlugins, DefaultPluginsOptions } from 'web-test-helpers'
import { createRouter as _createRouter } from 'web-runtime/src/router'
import { createMemoryHistory, RouterOptions } from 'vue-router'

jest.spyOn(console, 'warn').mockImplementation(() => undefined)

export const createStore = <T>(storeOptions: StoreOptions<T>) => {
  return _createStore(storeOptions)
}
export const mount = <T>(component: any, options?: MountingOptions<T>) => {
  return _mount<any>(component, options)
}

export const shallowMount = <T>(component: any, options?: MountingOptions<T>) => {
  options = options || {}
  options.shallow = true

  return mount(component, options)
}

export const getComposableWrapper = <T>(
  setup: any,
  {
    mocks = undefined,
    store = undefined,
    template = undefined,
    pluginOptions = undefined
  }: {
    mocks?: Record<string, unknown>
    store?: StoreOptions<T>
    template?: string
    pluginOptions?: DefaultPluginsOptions
  } = {}
) => {
  return mount(
    defineComponent({
      setup,
      template: template ? template : '<div></div>'
    }),
    {
      global: {
        plugins: [...defaultPlugins(pluginOptions), store],
        ...(mocks && { mocks })
      }
    }
  )
}

export const getStoreInstance = <T>(storeOptions: StoreOptions<T>) => {
  return _createStore(storeOptions)
}

export type { RouteLocation } from 'vue-router'
export { RouterLinkStub } from '@vue/test-utils'
export const createRouter = (options?: Partial<RouterOptions>) =>
  _createRouter({
    history: createMemoryHistory(),
    routes: [],
    strict: false,
    ...options
  })

export const createMockActionComposables = (module) => {
  const mockModule: Record<string, any> = {}
  for (const m of Object.keys(module)) {
    mockModule[m] = jest.fn(() => ({ actions: ref([]) }))
  }
  return mockModule
}

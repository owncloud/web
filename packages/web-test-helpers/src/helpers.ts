import { createStore as _createStore, StoreOptions } from 'vuex'
import { mount as _mount, MountingOptions } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { defaultPlugins } from 'web-test-helpers'

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

export const getComposableWrapper = (
  setup: any,
  { mocks = undefined, store = undefined, template = undefined } = {}
) => {
  return mount(
    defineComponent({
      setup,
      template: template ? template : '<div></div>'
    }),
    {
      global: {
        plugins: [...defaultPlugins(), store],
        ...(mocks && { mocks })
      }
    }
  )
}

export const getStoreInstance = <T>(storeOptions: StoreOptions<T>) => {
  return _createStore(storeOptions)
}

export { createRouter } from 'web-runtime/src/router'
export { RouterLinkStub } from '@vue/test-utils'

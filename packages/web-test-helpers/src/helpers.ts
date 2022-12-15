import { createLocalVue } from '@vue/test-utils'
import Vuex, { StoreOptions } from 'vuex'
import { mount as _mount } from '@vue/test-utils'
import { Component, Data, defineComponent, SetupFunction } from 'vue'
import { defaultPlugins } from 'web-test-helpers'
export { RouterLinkStub } from '@vue/test-utils'

export const createStore = <T>(storeOptions: StoreOptions<T>) => {
  return {
    install(app) {
      app.prototype.$store = new Vuex.Store(storeOptions)
    }
  }
}

type ComponentType = any

type CompatPlugin = any

type CompatGlobalMountOptions = {
  mocks?: object | false
  stubs?:
    | {
        [key: string]: Component | string | boolean
      }
    | string[]
  attrs?: Record<string, unknown>
  plugins?: (CompatPlugin | [CompatPlugin, ...any[]])[]
  directives?: { [key: string]: any }
  provide?: Record<any, any>
  components?: Record<string, ComponentType>
}

type CompatMountOptions = {
  props?: any
  data?: any
  attachTo?: HTMLElement | string
  global?: CompatGlobalMountOptions
  shallow?: boolean
  slots?: any
}

export const mount = (component: ComponentType, options: CompatMountOptions) => {
  const localVue = createLocalVue()

  options?.global?.plugins?.filter(Boolean).forEach((plugin) => {
    if (Array.isArray(plugin)) {
      localVue.use(plugin[0], plugin[1])
    } else {
      localVue.use(plugin)
    }
  })

  for (const [name, component] of Object.entries(options?.global?.components || {})) {
    localVue.component(name, component)
  }

  for (const [name, component] of Object.entries(options?.global?.components || {})) {
    localVue.component(name, component)
  }

  return _mount(component, {
    localVue,
    ...(options?.shallow && { shouldProxy: options.shallow }),
    ...(options?.props && { propsData: options.props }),
    ...(options?.data && { data: options.data }),
    ...(options?.attachTo && { attachTo: options.attachTo }),
    ...(options?.slots && { slots: options.slots }),
    ...(options?.global?.provide && { provide: options.global.provide }),
    ...(options?.global?.mocks && { mocks: options.global.mocks }),
    ...(options?.global?.stubs && { stubs: options.global.stubs })
  })
}

export const shallowMount = (component: ComponentType, options: CompatMountOptions) => {
  options = options || {}
  options.shallow = true

  return mount(component, options)
}

export const getComposableWrapper = (
  setup: SetupFunction<Data, Data>,
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
  const localVue = createLocalVue()
  localVue.use(Vuex)
  return new Vuex.Store(storeOptions)
}

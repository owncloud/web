import { defineComponent, SetupFunction, Data } from 'vue'
import { createLocalVue, mount, Wrapper } from '@vue/test-utils'
import Vuex from 'vuex'
import Vue from 'vue'

const localVue = createLocalVue()
localVue.use(Vuex)

export const createComposableWrapper = (
  setup: SetupFunction<Data, Data>,
  options = { mocks: undefined, store: undefined }
): Wrapper<Vue> =>
  mount(
    defineComponent({
      setup,
      template: `<div></div>`
    }),
    {
      localVue,
      ...(options.mocks && { mocks: options.mocks }),
      ...(options.store && { store: options.store })
    }
  )

import { defineComponent, SetupFunction, Data } from 'vue'
import { createLocalVue, mount, Wrapper } from '@vue/test-utils'
import Vuex from 'vuex'
import Vue from 'vue'

const localVue = createLocalVue()
localVue.use(Vuex)

export const createWrapper = (setup: SetupFunction<Data, Data>): Wrapper<Vue> =>
  mount(
    defineComponent({
      setup,
      template: `<div></div>`
    }),
    {
      localVue
    }
  )

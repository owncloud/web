import VueCompositionAPI, { defineComponent, SetupFunction, Data } from '@vue/composition-api'
import { createLocalVue, mount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'
import VueRouter from 'vue-router'

const localVue = createLocalVue()
localVue.use(VueCompositionAPI)
localVue.use(VueRouter)

export const createWrapper = (
  setup: SetupFunction<Data, Data>,
  { router, template }: { router?: VueRouter; template?: string }
): Wrapper<Vue> =>
  mount(
    defineComponent({
      template: `<div>${template}</div>`,
      setup
    }),
    {
      localVue,
      router
    }
  )

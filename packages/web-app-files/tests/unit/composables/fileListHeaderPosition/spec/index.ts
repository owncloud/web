import VueCompositionAPI, { defineComponent } from '@vue/composition-api'
import { createLocalVue, mount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'
import Vuex from 'vuex'
import { useFileListHeaderPosition } from '../../../../../src/composables'
import { useStore } from 'web-pkg/src/composables'

const localVue = createLocalVue()
localVue.use(VueCompositionAPI)
localVue.use(Vuex)

export const createWrapper = (): Wrapper<Vue> =>
  mount(
    defineComponent({
      template: `<div>{{ y }}</div>`,
      setup() {
        const { y, refresh } = useFileListHeaderPosition()

        return { y, refresh, store: useStore() }
      }
    }),
    {
      localVue,
      store: new Vuex.Store({
        modules: {
          Files: {
            state: {
              inProgress: []
            },
            mutations: {
              UPDATE(state, value) {
                state.inProgress = value
              }
            },
            getters: {
              inProgress(state) {
                return state.inProgress
              }
            },
            namespaced: true
          }
        }
      }),
      attachTo: document.body
    }
  )

export const createAppBar = (): {
  createElement: () => void
  resize: (height: number) => void
  remove: () => void
} => {
  const createElement = () => {
    const appBar = document.createElement('div')
    appBar.setAttribute('id', 'files-app-bar')

    document.body.appendChild(appBar)
  }
  const resize = (height = 0) => {
    document.getElementById('files-app-bar').getBoundingClientRect = jest
      .fn()
      .mockReturnValue({ height })
  }
  const remove = () => {
    document.getElementById('files-app-bar').remove()
  }

  return { createElement, resize, remove }
}

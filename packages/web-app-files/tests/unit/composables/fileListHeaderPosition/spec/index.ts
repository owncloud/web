import { defineComponent } from 'vue'
import { createLocalVue, mount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'
import Vuex from 'vuex'
import { useFileListHeaderPosition } from '../../../../../src/composables'
import { useStore } from 'web-pkg/src/composables'

const localVue = createLocalVue()
localVue.use(Vuex)

export const createWrapper = (): Wrapper<Vue> =>
  mount(
    defineComponent({
      setup() {
        const { y, refresh } = useFileListHeaderPosition()

        return { y, refresh, store: useStore() }
      },
      template: `<div>{{ y }}</div>`
    }),
    {
      localVue,
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

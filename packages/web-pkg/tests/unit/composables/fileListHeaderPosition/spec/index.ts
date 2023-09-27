import { defineComponent } from 'vue'
import { useFileListHeaderPosition } from '@ownclouders/web-pkg/src/composables'
import { useStore } from '@ownclouders/web-pkg/src/composables'
import { defaultPlugins, mount } from 'web-test-helpers'

export const createWrapper = () =>
  mount(
    defineComponent({
      setup() {
        const { y, refresh } = useFileListHeaderPosition()

        return { y, refresh, store: useStore() }
      },
      template: `<div>{{ y }}</div>`
    }),
    {
      attachTo: document.body,
      global: {
        plugins: [...defaultPlugins()]
      }
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

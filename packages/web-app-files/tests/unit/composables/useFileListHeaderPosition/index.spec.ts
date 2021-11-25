import { nextTick } from '@vue/composition-api'
import { createWrapper, createAppBar } from './spec'
import { useFileListHeaderPosition } from '../../../../src/composables'

describe('useFileListHeaderPosition', () => {
  it('should be valid', () => {
    const wrapper = createWrapper()

    expect(useFileListHeaderPosition).toBeDefined()
    expect(wrapper.vm.y).toBe(0)
    expect(wrapper.vm.refresh).toBeInstanceOf(Function)

    wrapper.destroy()
  })

  it('should calculate y on window resize', async () => {
    const wrapper = createWrapper()
    const appBar = createAppBar()

    appBar.createElement()

    for (const height of [50, 100, 150, 200, 201]) {
      appBar.resize(height)
      window.dispatchEvent(new Event('resize'))
      await nextTick()
      expect(wrapper.vm.y).toBe(height)
    }

    wrapper.destroy()
  })

  it('should calculate y on manual refresh', async () => {
    const wrapper = createWrapper()
    const appBar = createAppBar()

    appBar.createElement()

    for (const height of [50, 100, 150, 200, 201]) {
      appBar.resize(height)
      wrapper.vm.refresh()
      await nextTick()
      expect(wrapper.vm.y).toBe(height)
    }

    wrapper.destroy()
  })

  it('should calculate y on upload', async () => {
    const wrapper = createWrapper()
    const appBar = createAppBar()

    appBar.createElement()

    for (const height of [2, 3, 4, 5, 6]) {
      appBar.resize(height)
      wrapper.vm.store.commit('Files/UPDATE', height % 2 === 0 ? [undefined] : [])
      await nextTick()
      expect(wrapper.vm.y).toBe(height)
    }

    wrapper.destroy()
  })
})

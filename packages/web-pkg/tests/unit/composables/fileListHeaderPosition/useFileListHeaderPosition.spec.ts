import { nextTick } from 'vue'
import { createWrapper, createAppBar } from './spec'
import { useFileListHeaderPosition } from '../../../../src/composables'

describe('useFileListHeaderPosition', () => {
  it('should be valid', () => {
    const wrapper = createWrapper()

    expect(useFileListHeaderPosition).toBeDefined()
    expect((wrapper.vm as any).y).toBe(0)
    expect((wrapper.vm as any).refresh).toBeInstanceOf(Function)

    wrapper.unmount()
  })

  it('should calculate y on window resize', async () => {
    const wrapper = createWrapper()
    const appBar = createAppBar()

    appBar.createElement()

    for (const height of [50, 100, 150, 200, 201]) {
      appBar.resize(height)
      window.dispatchEvent(new Event('resize'))
      await nextTick()
      expect((wrapper.vm as any).y).toBe(height)
    }

    wrapper.unmount()
  })

  it('should calculate y on manual refresh', async () => {
    const wrapper = createWrapper()
    const appBar = createAppBar()

    appBar.createElement()

    for (const height of [50, 100, 150, 200, 201]) {
      appBar.resize(height)
      ;(wrapper.vm as any).refresh()
      await nextTick()
      expect((wrapper.vm as any).y).toBe(height)
    }

    wrapper.unmount()
  })
})

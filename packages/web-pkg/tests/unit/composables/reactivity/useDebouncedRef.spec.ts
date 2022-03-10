import { useDebouncedRef } from 'web-pkg/src/composables'
import { createWrapper } from '../router/spec'
import { nextTick } from '@vue/composition-api'

describe('useDebouncedRef', () => {
  it('should be valid', () => {
    expect(useDebouncedRef).toBeDefined()
  })

  it('should debounce', async () => {
    jest.useFakeTimers()

    const fastForward = async (ms: number) => {
      jest.advanceTimersByTime(ms)
      await nextTick()
    }
    const checker = useDebouncedRef(1, 500)
    const wrapper = createWrapper(() => ({ checker }), {
      template: '<div id="checker">{{checker}}</div>'
    })

    checker.value = 2
    await fastForward(0)
    expect(wrapper.find('#checker').element.innerHTML).toBe('1')
    expect(checker.value).toBe(1)
    await fastForward(499)
    expect(wrapper.find('#checker').element.innerHTML).toBe('1')
    expect(checker.value).toBe(1)
    await fastForward(1)
    expect(wrapper.find('#checker').element.innerHTML).toBe('2')
    expect(checker.value).toBe(2)

    checker.value = 3
    checker.value = 4
    checker.value = 5
    checker.value = 6
    await fastForward(0)
    expect(wrapper.find('#checker').element.innerHTML).toBe('2')
    expect(checker.value).toBe(2)
    await fastForward(499)
    expect(wrapper.find('#checker').element.innerHTML).toBe('2')
    expect(checker.value).toBe(2)
    await fastForward(1)
    expect(wrapper.find('#checker').element.innerHTML).toBe('6')
    expect(checker.value).toBe(6)
  })
})

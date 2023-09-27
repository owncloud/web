import {
  Key,
  ModifierKey,
  useKeyboardActions
} from '@ownclouders/web-pkg/src/composables/keyboardActions'
import { getComposableWrapper } from 'web-test-helpers'
import { ref } from 'vue'

describe('useKeyboardActions', () => {
  it('should be valid', () => {
    expect(useKeyboardActions).toBeDefined()
  })

  it('should bind keys', () => {
    const wrapper = getWrapper()
    const { keyboardActions } = wrapper.vm as any

    keyboardActions.bindKeyAction({ primary: Key.A })
    expect(keyboardActions.actions.value.length).toBe(1)

    wrapper.unmount()
  })

  it('should be possible remove keys', () => {
    const wrapper = getWrapper()
    const { keyboardActions } = wrapper.vm as any

    const keyActionIndex = keyboardActions.bindKeyAction({ primary: Key.A })

    expect(keyboardActions.actions.value.length).toBe(1)

    keyboardActions.removeKeyAction(keyActionIndex)
    expect(keyboardActions.actions.value.length).toBe(0)

    wrapper.unmount()
  })

  it('should be possible execute callback on key event', () => {
    const wrapper = getWrapper()
    const { keyboardActions } = wrapper.vm as any
    const counter = ref(0)

    const increment = () => {
      counter.value += 1
    }

    // primary key
    keyboardActions.bindKeyAction({ primary: Key.A }, increment)

    const event = new KeyboardEvent('keydown', { key: 'a' })
    document.dispatchEvent(event)

    expect(counter.value).toBe(1)

    // primary key + modifier
    keyboardActions.bindKeyAction({ modifier: ModifierKey.Ctrl, primary: Key.A }, increment)

    const eventWithModifier = new KeyboardEvent('keydown', { key: 'a', ctrlKey: true })
    document.dispatchEvent(eventWithModifier)

    expect(counter.value).toBe(2)

    wrapper.unmount()
  })
})

function getWrapper() {
  return getComposableWrapper(() => {
    const keyboardActions = useKeyboardActions()
    return { keyboardActions }
  })
}

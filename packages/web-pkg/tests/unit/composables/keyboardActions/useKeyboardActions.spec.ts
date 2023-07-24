import { Key, useKeyboardActions } from 'web-pkg/src/composables/keyboardActions'
import { getComposableWrapper } from 'web-test-helpers'
import { ref } from 'vue'

describe('useKeyboardActions', () => {
  it('should be valid', () => {
    expect(useKeyboardActions).toBeDefined()
  })

  it('should bind keys', () => {
    let keyboardActions = null

    getComposableWrapper(() => (keyboardActions = useKeyboardActions()))

    keyboardActions.bindKeyAction({ primary: Key.A })
    expect(keyboardActions.actions.value.filter((action) => action !== null).length).toBe(1)
  })

  it('should be possible remove keys', () => {
    let keyboardActions = null

    getComposableWrapper(() => (keyboardActions = useKeyboardActions()))

    const keyActionIndex = keyboardActions.bindKeyAction({ primary: Key.A })

    expect(keyboardActions.actions.value.filter((action) => action !== null).length).toBe(1)

    keyboardActions.removeKeyAction(keyActionIndex)
    expect(keyboardActions.actions.value.filter((action) => action !== null).length).toBe(0)
  })

  it('should be possible execute callback on key event', () => {
    let keyboardActions = null
    const counter = ref(0)

    const incrementCounter = () => (counter.value += 1)
    getComposableWrapper(() => (keyboardActions = useKeyboardActions()))

    keyboardActions.bindKeyAction({ primary: Key.C }, incrementCounter)

    const event = new KeyboardEvent('keydown', { key: 'c' })
    document.dispatchEvent(event)

    expect(counter.value).toBe(1)
  })
})

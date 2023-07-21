import { onBeforeUnmount, onMounted, ref } from 'vue'

export enum Key {
  C = 'c',
  V = 'v',
  A = 'a',
  Space = ' ',
  ArrowUp = 'ArrowUp',
  ArrowDown = 'ArrowDown',
  Esc = 'Escape'
}

export enum ModifierKey {
  Ctrl = 'Control',
  Shift = 'Shift'
}

export const useKeyboardActions = (keyBindOnElementId: string | null = null) => {
  const actions = ref([])
  const listener = (event: KeyboardEvent): void => {
    event.preventDefault()
    const { key, ctrlKey, metaKey, shiftKey } = event
    let modifier = null
    if (metaKey || ctrlKey) {
      modifier = ModifierKey.Ctrl
    } else if (shiftKey) {
      modifier = ModifierKey.Shift
    }
    const action = actions.value
      .filter((action) => action !== null)
      .find((action) => {
        return action.primary === key && action.modifier === modifier
      })
    if (action) {
      action.callback(event)
    }
  }
  const bindKeyAction = (
    keys: { primary: Key; modifier?: ModifierKey },
    callback: () => void
  ): number => {
    return (
      actions.value.push({
        ...keys,
        modifier: keys.modifier ?? null,
        callback
      }) - 1
    )
  }

  const removeKeyAction = (index): void => {
    actions.value[index] = null
  }

  onMounted(() => {
    let element = null
    if (keyBindOnElementId) {
      element = document.getElementById(keyBindOnElementId)
    }
    element
      ? element.addEventListener('keydown', listener)
      : document.addEventListener('keydown', listener)
  })

  onBeforeUnmount(() => {
    let element = null
    if (keyBindOnElementId) {
      element = document.getElementById(keyBindOnElementId)
    }
    element
      ? element.removeEventListener('keydown', listener)
      : document.removeEventListener('keydown', listener)
  })

  return {
    bindKeyAction,
    removeKeyAction
  }
}

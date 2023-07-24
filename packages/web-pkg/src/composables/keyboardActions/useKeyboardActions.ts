import { onBeforeUnmount, onMounted, Ref, ref } from 'vue'

export enum Key {
  C = 'c',
  V = 'v',
  X = 'x',
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

export interface KeyboardActions {
  actions: Ref<any[]>
  selectionCursor: Ref<number>
  removeKeyAction: (index: number) => void
  resetSelectionCursor: () => void
  bindKeyAction: (keys: { primary: Key; modifier?: ModifierKey }, callback: () => void) => number
}

export const useKeyboardActions = (keyBindOnElementId: string | null = null): KeyboardActions => {
  const actions = ref([])
  const selectionCursor = ref(0)
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

  const removeKeyAction = (index: number): void => {
    if (actions.value[index] !== undefined) {
      actions.value[index] = null
    }
  }

  const resetSelectionCursor = (): void => {
    selectionCursor.value = 0
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
    actions,
    bindKeyAction,
    removeKeyAction,
    selectionCursor,
    resetSelectionCursor
  }
}

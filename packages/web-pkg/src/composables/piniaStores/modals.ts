import { ContextualHelperData } from 'design-system/src/helpers'
import { defineStore } from 'pinia'
import { v4 as uuidV4 } from 'uuid'
import { Component, ComponentPublicInstance, computed, ref, unref } from 'vue'

export type CustomModalComponent = Component<{ modal: Modal } & Record<string, any>>

export type CustomModalComponentEmits = {
  confirm?: () => Promise<void>
  cancel?: () => void
  'update:confirmDisabled': (value: boolean) => void
} & Record<string, any>

export type CustomModalComponentInstance = ComponentPublicInstance<
  { modal: Modal } & unknown,
  { onConfirm?: () => Promise<unknown>; onCancel?: () => unknown },
  any,
  any,
  any,
  CustomModalComponentEmits
>

export type Modal = {
  id: string
  active: boolean
  title: string
  variation?: string
  icon?: string
  message?: string
  cancelText?: string
  confirmDisabled?: boolean
  confirmText?: string
  hideActions?: boolean
  hideConfirmButton?: boolean
  hasInput?: boolean
  inputValue?: string
  inputType?: string
  inputSelectionRange?: [number, number]
  inputLabel?: string
  inputError?: string
  inputDescription?: string
  focusTrapInitial?: string
  contextualHelperLabel?: string
  contextualHelperData?: ContextualHelperData
  customComponent?: CustomModalComponent
  customComponentAttrs?: () => Record<string, unknown>
  onCancel?: () => void
  onConfirm?: (value: string) => Promise<void>
  onInput?: (value: string, setError: (error: string) => void) => void
}

export const useModals = defineStore('modals', () => {
  const modals = ref<Modal[]>([])
  const activeModal = computed(() => unref(modals).find(({ active }) => active === true))

  const getModal = (id: Modal['id']) => {
    return unref(modals).find((modal) => modal.id === id)
  }

  const registerModal = (
    data: Omit<Modal, 'id' | 'active'>,
    { isActive = true }: { isActive?: boolean } = {}
  ) => {
    const modal = { ...data, id: uuidV4() as string, active: isActive }

    if (isActive && unref(activeModal)) {
      unref(activeModal).active = false
    }

    modals.value.push(modal)
    return modal
  }

  const updateModal = <T extends Modal, K extends keyof Modal>(
    id: T['id'],
    key: K,
    value: T[K]
  ) => {
    const modal = getModal(id)
    modal[key] = value
  }

  const removeModal = (id: Modal['id']) => {
    modals.value = unref(modals).filter((modal) => modal.id !== id)

    if (unref(modals).length && !unref(activeModal)) {
      // set next modal active
      unref(modals)[0].active = true
    }
  }

  const setModalActive = (id: Modal['id']) => {
    if (unref(activeModal)) {
      activeModal.value.active = false
    }

    const modal = getModal(id)
    modal.active = true
  }

  return { modals, activeModal, registerModal, updateModal, removeModal, setModalActive }
})

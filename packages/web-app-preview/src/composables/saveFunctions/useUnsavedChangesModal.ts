import { $gettext } from '../../../../web-app-files/src/router/utils'
import { Store } from 'vuex'
import { useStore } from 'web-pkg/src/composables'

export function useSaveUnsavedChangesModal(
  cancelFuncs: Array<(...args: any[]) => Promise<any> | any>,
  confirmFuncs: Array<(...args: any[]) => Promise<any> | any>,
  store?: Store<any>
) {
  store = store || useStore()

  const modal = {
    variation: 'danger',
    icon: 'warning',
    title: $gettext('Unsaved changes'),
    message: $gettext('Your changes were not saved. Do you want to save them?'),
    cancelText: $gettext("Don't Save"),
    confirmText: $gettext('Save'),
    onCancel: () => {
      store.dispatch('hideModal')
      cancelFuncs.forEach(async (func) => await func())
    },
    onConfirm: () => {
      store.dispatch('hideModal')
      confirmFuncs.forEach(async (func) => await func())
    }
  }
  store.dispatch('createModal', modal)
}

export function useCancelUnsavedChangesModal(
  cancelFuncs: Array<(...args: any[]) => Promise<any>>,
  confirmFuncs: Array<(...args: any[]) => Promise<any>>,
  store?: Store<any>
) {
  store = store || useStore()
  const modal = {
    variation: 'danger',
    icon: 'warning',
    title: $gettext('Unsaved changes'),
    message: $gettext('Your changes were not saved. Do you want to save and download?'),
    cancelText: $gettext('Cancel'),
    confirmText: $gettext('Download'),
    onCancel: () => {
      store.dispatch('hideModal')
      cancelFuncs.forEach(async (func) => await func())
    },
    onConfirm: () => {
      store.dispatch('hideModal')
      confirmFuncs.forEach(async (func) => await func())
    }
  }
  store.dispatch('createModal', modal)
}

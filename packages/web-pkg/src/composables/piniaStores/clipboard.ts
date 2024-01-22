import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Resource } from '@ownclouders/web-client'
import { ClipboardActions } from '../../helpers'
import { useGettext } from 'vue3-gettext'
import { useMessages } from './messages'

export const useClipboardStore = defineStore('clipboard', () => {
  const { $gettext } = useGettext()
  const { showMessage } = useMessages()

  const action = ref<ClipboardActions>()
  const resources = ref<Resource[]>([])

  const copyResources = (r: Resource[]) => {
    action.value = ClipboardActions.Copy
    resources.value = r

    showMessage({ title: $gettext('Copied to clipboard!'), status: 'success' })
  }

  const cutResources = (r: Resource[]) => {
    action.value = ClipboardActions.Cut
    resources.value = r

    showMessage({ title: $gettext('Cut to clipboard!'), status: 'success' })
  }

  const clearClipboard = () => {
    action.value = undefined
    resources.value = []
  }

  return {
    action,
    resources,

    copyResources,
    cutResources,
    clearClipboard
  }
})

export type ClipboardStore = ReturnType<typeof useClipboardStore>

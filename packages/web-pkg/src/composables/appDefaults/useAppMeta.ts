import { Store } from 'vuex'
import { computed, Ref } from '@vue/composition-api'
import type { AppConfigObject } from './types'

interface AppMetaOptions {
  store: Store<any>
  applicationId: string
}

export interface AppMetaObject {
  config: AppConfigObject
  autosave: boolean
  theme: string
  url: string
  icon: string
  id: string
  img: string
  name: string
}

export interface AppMetaResult {
  applicationMeta: Ref<AppMetaObject>
}

export function useAppMeta({ store, applicationId }: AppMetaOptions): AppMetaResult {
  const applicationMeta = computed(() => {
    const editor = store.getters.apps[applicationId]
    if (!editor) {
      throw new Error(`useAppConfig: could not find config for applicationId: ${applicationId}`)
    }
    return editor || {}
  })

  return {
    applicationMeta
  }
}

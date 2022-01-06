import { Store } from 'vuex'
import { computed, Ref } from '@vue/composition-api'

interface AppConfigOptions {
  store: Store<any>
  applicationName: string
}

type AppConfigObject = Record<string, any>

export interface AppConfigResult {
  applicationConfig: Ref<AppConfigObject>
}

export function useAppConfig(options: AppConfigOptions): AppConfigResult {
  const store = options.store
  const applicationName = options.applicationName
  const applicationConfig = computed(() => {
    const editor = store.state.apps.fileEditors.find((e) => e.app === applicationName)
    if (!editor) {
      throw new Error(`useAppConfig: could not find config for applicationName: ${applicationName}`)
    }
    return editor.config || {}
  })

  return {
    applicationConfig
  }
}

import { App, ComponentCustomProperties } from 'vue'
import { Router } from 'vue-router'
import { Store } from 'vuex'

export interface AppReadyHookArgs {
  announceExtension: (extension: { [key: string]: unknown }) => void
  globalProperties: ComponentCustomProperties & Record<string, any>
  router: Router
  store: Store<unknown>
  instance?: App
  portal?: any
}

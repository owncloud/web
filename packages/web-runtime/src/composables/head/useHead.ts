import { computed } from 'vue'
import { Store } from 'vuex'
import { useHead as _useHead } from '@vueuse/head'
import { getBackendVersion, getWebVersion } from 'web-runtime/src/container/versions'

export const useHead = ({ store }: { store: Store<any> }) => {
  _useHead(
    computed(() => {
      const favicon = store.getters['configuration']?.currentTheme?.logo?.favicon
      return {
        meta: [
          {
            name: 'generator',
            content: [getWebVersion(), getBackendVersion({ store })].filter(Boolean).join(', ')
          }
        ],
        ...(favicon && { link: [{ rel: 'icon', href: favicon }] })
      }
    })
  )
}

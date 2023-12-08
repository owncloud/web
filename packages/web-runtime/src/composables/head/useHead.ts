import { computed, unref } from 'vue'
import { Store } from 'vuex'
import { useHead as _useHead } from '@vueuse/head'
import { getBackendVersion, getWebVersion } from 'web-runtime/src/container/versions'
import { useThemeStore } from '@ownclouders/web-pkg'
import { storeToRefs } from 'pinia'

export const useHead = ({ store }: { store: Store<any> }) => {
  const themeStore = useThemeStore()
  const { currentTheme } = storeToRefs(themeStore)

  _useHead(
    computed(() => {
      const favicon = computed(() => currentTheme.value.logo.favicon)

      return {
        meta: [
          {
            name: 'generator',
            content: [getWebVersion(), getBackendVersion({ store })].filter(Boolean).join(', ')
          }
        ],
        ...(unref(favicon) && { link: [{ rel: 'icon', href: favicon }] })
      }
    })
  )
}

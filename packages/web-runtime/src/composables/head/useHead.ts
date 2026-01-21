import { computed, unref, onMounted, ref } from 'vue'
import { useHead as _useHead } from '@vueuse/head'
import {
  useCapabilityStore,
  useThemeStore,
  getBackendVersion,
  getWebVersion
} from '@ownclouders/web-pkg'
import { storeToRefs } from 'pinia'

export const useHead = () => {
  const themeStore = useThemeStore()
  const capabilityStore = useCapabilityStore()
  const { currentTheme } = storeToRefs(themeStore)

  const favicon = computed(() => currentTheme.value.logo.favicon)

  // Get brand color from CSS variable set by theme
  const themeColor = ref('#375f7E')
  onMounted(() => {
    const brandColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--oc-color-swatch-brand-default')
      .trim()
    if (brandColor) {
      themeColor.value = brandColor
    }
  })

  _useHead(
    computed(() => {
      return {
        meta: [
          {
            name: 'generator',
            content: [getWebVersion(), getBackendVersion({ capabilityStore })]
              .filter(Boolean)
              .join(', ')
          },
          {
            name: 'theme-color',
            content: unref(themeColor)
          }
        ],
        ...(unref(favicon) && { link: [{ rel: 'icon', href: unref(favicon) }] })
      }
    })
  )
}

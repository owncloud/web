import { useViewSize } from './useViewMode'
import { computed, onBeforeUnmount, onMounted, ref, unref } from 'vue'

export const useTileSize = () => {
  const viewSize = useViewSize(null)

  const themeVarToPixels = (value: string) => {
    if (!value.endsWith('rem') && !value.endsWith('px')) {
      return 0
    }
    if (value.endsWith('rem')) {
      const rem = parseInt(value.replace('rem', '').trim())
      const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize)
      return rem * fontSize
    }
    return parseInt(value.replace('px', '').trim())
  }

  const baseSizePixels = ref<number>(0)
  const stepSizePixels = ref<number>(0)
  const updateThemeVars = () => {
    // FIXME: css root vars are undefined o_O
    const rootStyle = (document.querySelector(':root') as HTMLElement).style
    baseSizePixels.value = themeVarToPixels(
      rootStyle.getPropertyValue('--oc-size-tiles-resize-default')
    )
    stepSizePixels.value = themeVarToPixels(
      rootStyle.getPropertyValue('--oc-size-tiles-resize-step')
    )
  }
  const observer = new MutationObserver(updateThemeVars)
  onMounted(() => {
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] })
  })
  onBeforeUnmount(() => {
    observer?.disconnect()
  })

  const tileSizePixels = computed(() => {
    return unref(baseSizePixels) + (unref(viewSize) - 1) * unref(stepSizePixels)
  })
  const tileSizeRem = computed(() => {
    const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize)
    return unref(tileSizePixels) / fontSize
  })

  return {
    tileSizePixels,
    tileSizeRem
  }
}

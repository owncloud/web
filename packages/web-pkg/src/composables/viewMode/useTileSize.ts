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
    const element = document.documentElement
    const styles = getComputedStyle(element)
    baseSizePixels.value = themeVarToPixels(styles.getPropertyValue('--oc-size-tiles-default'))
    stepSizePixels.value = themeVarToPixels(styles.getPropertyValue('--oc-size-tiles-resize-step'))
  }
  onMounted(() => {
    updateThemeVars()
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

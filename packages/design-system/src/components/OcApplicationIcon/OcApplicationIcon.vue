<template>
  <div
    class="oc-application-icon oc-flex-inline oc-flex-middle oc-flex-center"
    :style="iconBackgroundStyle"
  >
    <oc-icon :name="icon" color="rgba(255,255,255,0.7)" size="medium" class="" />
  </div>
</template>

<script lang="ts">
import {
  cssRgbToHex,
  generateHashedColorForString,
  hexToRgb,
  rgbToHex,
  setDesiredContrastRatio,
  shadeColor
} from '../../helpers'
import { computed, defineComponent } from 'vue'
import OcIcon from '../OcIcon/OcIcon.vue'

export default defineComponent({
  components: { OcIcon },
  name: 'OcApplicationIcon',
  status: 'ready',
  release: '15.0.0',
  props: {
    icon: {
      type: String,
      required: true
    },
    colorPrimary: {
      type: String,
      required: false,
      default: ''
    },
    colorSecondary: {
      type: String,
      required: false,
      default: ''
    }
  },

  setup(props) {
    const getGradient = (primary: string, secondary: string): string => {
      return `linear-gradient(90deg, ${primary} 0%, ${secondary} 100%)`
    }
    const getHexFromCssVar = (color: string): string => {
      if (!color) {
        return ''
      }
      // if color is a hex value, return it
      if (color.startsWith('#')) {
        return color
      }
      const varName = color.match(/var\(([^)]+)\)/)?.[1] || color
      const result = getComputedStyle(document.documentElement).getPropertyValue(varName)
      // if css var is hex value, return it
      if (result.startsWith('#')) {
        return result
      }
      return cssRgbToHex(result)
    }
    const iconBackgroundStyle = computed(() => {
      let randomHex
      // if no color is defined, generate a random hashed color
      if (!props.colorPrimary) {
        randomHex = generateHashedColorForString(props.icon)
        randomHex = setDesiredContrastRatio(hexToRgb(randomHex), hexToRgb('#ffffff'), 4)
      }
      const primary = getHexFromCssVar(props.colorPrimary) || rgbToHex(randomHex)
      // if no secondary color is defined, generate a shade of the primary color to create gradient
      const secondary = getHexFromCssVar(props.colorSecondary) || shadeColor(hexToRgb(primary), 40)
      return {
        background: getGradient(primary, secondary)
      }
    })

    return {
      iconBackgroundStyle
    }
  }
})
</script>

<style lang="scss">
.oc-application-icon {
  width: 35px;
  height: 35px;
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.21) 0px 1px 4px;
}
</style>

<docs>
```js
<oc-application-icon :count="21" />
```
</docs>

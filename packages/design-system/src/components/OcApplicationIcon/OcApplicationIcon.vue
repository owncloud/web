<template>
  <div
    class="oc-application-icon oc-flex oc-flex-middle oc-flex-center"
    :style="iconBackgroundStyle"
  >
    <oc-icon :name="icon" color="white" size="medium" class="" />
  </div>
</template>

<script lang="ts">
import {
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
    const iconBackgroundStyle = computed(() => {
      let randomHex
      if (!props.colorPrimary) {
        randomHex = generateHashedColorForString(props.icon)
        randomHex = setDesiredContrastRatio(hexToRgb(randomHex), hexToRgb('#ffffff'), 4)
      }
      const primary = props.colorPrimary || rgbToHex(randomHex)
      const secondary = props.colorSecondary || shadeColor(randomHex, 40)
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
  width: 40px;
  height: 40px;
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.21) 0px 1px 4px;
}
</style>

<docs>
```js
<oc-application-icon :count="21" />
```
</docs>

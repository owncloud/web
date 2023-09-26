<template>
  <div class="oc-application-icon oc-flex-inline oc-flex-middle oc-flex-center" :style="iconStyle">
    <oc-icon :name="icon" :color="iconColor" size="medium" />
  </div>
</template>

<script lang="ts">
import {
  generateHashedColorForString,
  getHexFromCssVar,
  hexToRgb,
  rgbToHex,
  setDesiredContrastRatio,
  shadeColor
} from '../../helpers'
import { computed, defineComponent, ref, unref } from 'vue'
import OcIcon from '../OcIcon/OcIcon.vue'

export default defineComponent({
  name: 'OcApplicationIcon',
  components: { OcIcon },
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
    const updateComputed = ref(false)
    const iconColor = computed(() => {
      return 'rgba(255,255,255,0.7)'
    })
    const getGradient = (primary: string, secondary: string): string => {
      return `linear-gradient(90deg, ${primary} 0%, ${secondary} 100%)`
    }
    const primaryColor = computed(() => {
      unref(updateComputed)
      return getHexFromCssVar(props.colorPrimary)
    })
    const secondaryColor = computed(() => {
      unref(updateComputed)
      return getHexFromCssVar(props.colorSecondary)
    })
    const hasPrimaryColor = computed(() => {
      return !!props.colorPrimary
    })
    const hasSecondaryColor = computed((): boolean => {
      return !!props.colorSecondary
    })
    const generatedHashedPrimaryColor = computed((): string => {
      let hashedColor = generateHashedColorForString(props.icon)
      return rgbToHex(setDesiredContrastRatio(hexToRgb(hashedColor), hexToRgb('#ffffff'), 4))
    })
    const iconStyle = computed(() => {
      const primaryHex = unref(hasPrimaryColor)
        ? unref(primaryColor)
        : unref(generatedHashedPrimaryColor)
      const secondaryHex = unref(hasSecondaryColor)
        ? unref(secondaryColor)
        : shadeColor(hexToRgb(primaryHex), 40)

      const darkBorderHex = shadeColor(hexToRgb(primaryHex), -25)
      const lightBorderHex = shadeColor(hexToRgb(primaryHex), 45)
      return {
        background: getGradient(primaryHex, secondaryHex),
        boxShadow: `inset ${lightBorderHex} 0px 0px 1px 0px,${darkBorderHex} 0px 0px 1px 0px`
      }
    })

    const update = () => {
      updateComputed.value = !unref(updateComputed)
    }

    return {
      iconColor,
      iconStyle,
      update
    }
  }
})
</script>

<style lang="scss">
.oc-application-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  .oc-icon {
    height: 18px !important;
    max-height: 18px !important;
    max-width: 18px !important;
    width: 18px !important;
    svg {
      height: 18px !important;
      max-height: 18px !important;
      max-width: 18px !important;
      width: 18px !important;
    }
  }
}
</style>

<docs>
```js
<oc-application-icon :count="21" />
```
</docs>

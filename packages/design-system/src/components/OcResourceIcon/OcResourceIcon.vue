<template>
  <oc-icon
    :key="`resource-icon-${iconName}`"
    :name="iconName"
    :color="iconColor"
    :size="size"
    :class="['oc-resource-icon', iconTypeClass]"
  />
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Resource } from 'web-client'

import OcIcon from '../OcIcon/OcIcon.vue'
import { AVAILABLE_SIZES } from '../../helpers'
import * as iconColorMap from '../../helpers/resourceIconColorExtensionMapping.json'
import * as iconNameMap from '../../helpers/resourceIconExtensionMapping.json'

const defaultFolderColor = 'var(--oc-color-icon-folder)'
const defaultFolderIcon = 'resource-type-folder'
const defaultSpaceColor = 'var(--oc-color-swatch-passive-default)'
const defaultSpaceIcon = 'layout-grid'
const defaultFallbackIconColor = 'var(--oc-color-text-default)'
const defaultFallbackIcon = 'file'

export default defineComponent({
  name: 'OcResourceIcon',
  status: 'ready',
  release: '12.0.0',
  components: { OcIcon },
  props: {
    /**
     * The resource to be displayed
     */
    resource: {
      type: Object as PropType<Resource>,
      required: true
    },
    /**
     * The size of the icon. Defaults to small.
     * `xsmall, small, medium, large, xlarge, xxlarge`
     */
    size: {
      type: String,
      default: 'large',
      validator: (value: string): boolean => {
        return AVAILABLE_SIZES.some((e) => e === value)
      }
    }
  },
  computed: {
    iconName() {
      if (this.isSpace) {
        return defaultSpaceIcon
      }
      if (this.isFolder) {
        return defaultFolderIcon
      }
      const icon = iconNameMap[this.extension]
      return `resource-type-${icon ? icon : defaultFallbackIcon}`
    },
    iconColor() {
      if (this.isSpace) {
        return defaultSpaceColor
      }
      if (this.isFolder) {
        return defaultFolderColor
      }
      const color = iconColorMap[this.extension]
      return color ? color : defaultFallbackIconColor
    },
    iconTypeClass() {
      if (this.isSpace) {
        return 'oc-resource-icon-space'
      }
      if (this.isFolder) {
        return 'oc-resource-icon-folder'
      }
      return 'oc-resource-icon-file'
    },
    isFolder() {
      // fallback is necessary since
      // sometimes resources without a type
      // but with `isFolder` are being passed
      return this.resource.type === 'folder' || this.resource.isFolder
    },
    isSpace() {
      return this.resource.type === 'space'
    },
    extension() {
      return this.resource.extension?.toLowerCase()
    }
  }
})
</script>

<style lang="scss">
.oc-resource-icon {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  &-file svg {
    height: 70%;
  }
}
</style>

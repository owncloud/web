<template>
  <oc-icon
    :key="`resource-icon-${iconName}`"
    :name="iconName"
    :color="iconColor"
    :size="size"
    :class="[
      'oc-resource-icon',
      { 'oc-resource-icon-file': !isFolder, 'oc-resource-icon-folder': isFolder }
    ]"
  />
</template>

<script>
import OcIcon from '../OcIcon/OcIcon.vue'
import iconNameMap from '../../helpers/resourceIconExtensionMapping'
import iconColorMap from '../../helpers/resourceIconColorExtensionMapping'

const defaultFolderColor = 'var(--oc-color-icon-folder)'
const defaultFolderIcon = 'resource-type-folder'
const defaultFallbackIconColor = 'var(--oc-color-text-default)'
const defaultFallbackIcon = 'file'

export default {
  name: 'OcResourceIcon',
  status: 'ready',
  release: '12.0.0',
  components: { OcIcon },
  props: {
    /**
     * The resource to be displayed
     */
    resource: {
      type: Object,
      required: true
    },
    /**
     * The size of the icon. Defaults to small.
     * `xsmall, small, medium, large, xlarge, xxlarge`
     */
    size: {
      type: String,
      default: 'large',
      validator: (value) => {
        return value.match(/(xsmall|small|medium|large|xlarge|xxlarge|xxxlarge)/)
      }
    }
  },
  computed: {
    iconName() {
      if (this.isFolder) return defaultFolderIcon
      const icon = iconNameMap[this.extension]
      return `resource-type-${icon ? icon : defaultFallbackIcon}`
    },
    iconColor() {
      if (this.isFolder) return defaultFolderColor
      const color = iconColorMap[this.extension]
      return color ? color : defaultFallbackIconColor
    },
    isFolder() {
      return this.resource.isFolder
    },
    extension() {
      return this.resource.extension?.toLowerCase()
    }
  }
}
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

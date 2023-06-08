<template>
  <oc-icon
    :key="`resource-icon-${icon.name}`"
    :name="icon.name"
    :color="icon.color"
    :size="size"
    :class="['oc-resource-icon', iconTypeClass]"
  />
</template>

<script lang="ts">
import { computed, defineComponent, inject, PropType, unref } from 'vue'
import { Resource } from 'web-client'

import OcIcon from '../OcIcon/OcIcon.vue'
import { AVAILABLE_SIZES, IconType } from '../../helpers'
import * as iconMapping from '../../helpers/resourceIconMapping.json'

import { OcResourceIconMapping, ocResourceIconMappingInjectionKey } from './types'

const defaultFolderColor = 'var(--oc-color-icon-folder)'
const defaultFolderIcon = 'resource-type-folder'
const defaultSpaceColor = 'var(--oc-color-swatch-passive-default)'
const defaultSpaceIcon = 'layout-grid'
const defaultFallbackIconColor = 'var(--oc-color-text-default)'
const defaultFallbackIcon = 'resource-type-file'

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
  setup(props) {
    const iconMappingInjection = inject<OcResourceIconMapping>(ocResourceIconMappingInjectionKey)

    const isFolder = computed(() => {
      // fallback is necessary since
      // sometimes resources without a type
      // but with `isFolder` are being passed
      return props.resource.type === 'folder' || props.resource.isFolder
    })

    const isSpace = computed(() => {
      return props.resource.type === 'space'
    })
    const extension = computed(() => {
      return props.resource.extension?.toLowerCase()
    })

    const icon = computed((): IconType => {
      if (unref(isSpace)) {
        return { name: defaultSpaceIcon, color: defaultSpaceColor }
      }
      if (unref(isFolder)) {
        return { name: defaultFolderIcon, color: defaultFolderColor }
      }

      let icon = iconMappingInjection?.mimeType[props.resource.mimeType]
      if (icon) {
        return icon
      }

      icon = iconMappingInjection?.extension[props.resource.extension]
      if (icon) {
        return icon
      }

      icon = iconMapping[unref(extension)] as IconType
      const name = icon?.name || defaultFallbackIcon
      const color = icon?.color || defaultFallbackIconColor

      return {
        name,
        color
      }
    })

    const iconTypeClass = computed(() => {
      if (unref(isSpace)) {
        return 'oc-resource-icon-space'
      }
      if (unref(isFolder)) {
        return 'oc-resource-icon-folder'
      }
      return 'oc-resource-icon-file'
    })

    return {
      icon,
      iconTypeClass
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

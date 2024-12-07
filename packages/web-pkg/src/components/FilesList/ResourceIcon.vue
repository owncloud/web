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
import { Resource } from '@ownclouders/web-client'
import { AVAILABLE_SIZES } from '@ownclouders/design-system/helpers'
import {
  IconType,
  createDefaultFileIconMapping,
  ResourceIconMapping,
  resourceIconMappingInjectionKey
} from '../../helpers/resource/icon'

const defaultFolderIcon: IconType = {
  name: 'resource-type-folder',
  color: 'var(--oc-color-icon-folder)'
}

const defaultSpaceIcon: IconType = {
  name: 'layout-grid',
  color: 'var(--oc-color-secondary)'
}
const defaultFallbackIcon: IconType = {
  name: 'resource-type-file',
  color: 'var(--oc-color-onSurface)'
}

const defaultFileIconMapping = createDefaultFileIconMapping()

export default defineComponent({
  name: 'ResourceIcon',
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
    const iconMappingInjection = inject<ResourceIconMapping>(resourceIconMappingInjectionKey)

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
    const mimeType = computed(() => {
      return props.resource.mimeType?.toLowerCase()
    })

    const icon = computed((): IconType => {
      if (unref(isSpace)) {
        return defaultSpaceIcon
      }
      if (unref(isFolder)) {
        return defaultFolderIcon
      }

      const icon =
        defaultFileIconMapping[unref(extension)] ||
        iconMappingInjection?.mimeType[unref(mimeType)] ||
        iconMappingInjection?.extension[unref(extension)]

      return {
        ...defaultFallbackIcon,
        ...icon
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
span.oc-resource-icon {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;

  &-file svg {
    height: 70%;
  }
}
</style>

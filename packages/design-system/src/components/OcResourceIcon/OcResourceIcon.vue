<template>
  <span>
    <oc-icon
      ref="iconRef"
      :key="`resource-icon-${icon.name}`"
      :name="icon.name"
      :color="icon.color"
      :size="size"
      :class="['oc-resource-icon', iconTypeClass]"
      @loaded="iconLoaded = true"
    >
    </oc-icon>
    <span
      v-if="Object.keys(badgeIconAttrs).length"
      ref="badgeRef"
      class="oc-resource-icon-status-badge"
      :style="badgeStyle"
    >
      <oc-icon v-bind="badgeIconAttrs" />
    </span>
  </span>
</template>

<script lang="ts">
import { computed, defineComponent, inject, nextTick, PropType, ref, unref, watch } from 'vue'
import { Resource } from '@ownclouders/web-client'

import OcIcon from '../OcIcon/OcIcon.vue'
import { AVAILABLE_SIZES, IconType, createDefaultFileIconMapping } from '../../helpers'

import { OcResourceIconMapping, ocResourceIconMappingInjectionKey } from './types'

const defaultFolderIcon: IconType = {
  name: 'resource-type-folder',
  color: 'var(--oc-color-icon-folder)'
}

const defaultSpaceIcon: IconType = {
  name: 'layout-grid',
  color: 'var(--oc-color-swatch-passive-default)'
}
const defaultFallbackIcon: IconType = {
  name: 'resource-type-file',
  color: 'var(--oc-color-text-default)'
}

const defaultFileIconMapping = createDefaultFileIconMapping()

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
    const iconRef = ref()
    const iconLoaded = ref(false)
    const badgeRef = ref()
    const badgeStyle = ref({})
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

    watch([() => props.size, iconLoaded], async () => {
      await nextTick()

      if (!unref(iconLoaded)) {
        return false
      }

      const iconBoundingClientRect = unref(iconRef)?.$el?.getBoundingClientRect()
      if (!iconBoundingClientRect) {
        return
      }

      const innerIconBoundingClientRect = unref(iconRef)
        ?.$el?.getElementsByTagName('path')?.[1]
        ?.getBoundingClientRect()
      if (!innerIconBoundingClientRect) {
        return
      }

      const iconOffsetHeight =
        (iconBoundingClientRect.height - innerIconBoundingClientRect.height) / 2
      const iconOffsetWidth = (iconBoundingClientRect.width - innerIconBoundingClientRect.width) / 2

      const badgeBoundingClientRect = unref(badgeRef)?.getBoundingClientRect()
      if (!badgeBoundingClientRect) {
        return
      }

      const badgeBottom = iconOffsetHeight - badgeBoundingClientRect.height / 3
      const badgeRight = iconOffsetWidth - badgeBoundingClientRect.width / 1.8

      badgeStyle.value = {
        right: `${badgeRight}px`,
        bottom: `${badgeBottom}px`
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

    const badgeIconSize = computed(() => {
      if (['xxxlarge', 'xxlarge'].includes(props.size)) {
        return 'medium'
      }

      return 'xsmall'
    })

    const badgeIconAttrs = computed(() => {
      if (props.resource.locked) {
        return {
          name: 'lock',
          fillType: 'fill',
          size: unref(badgeIconSize)
        }
      }
      if (props.resource.processing) {
        return {
          name: 'loop-right',
          fillType: 'line',
          size: unref(badgeIconSize)
        }
      }

      return {}
    })

    return {
      icon,
      iconRef,
      badgeRef,
      badgeStyle,
      iconTypeClass,
      badgeIconAttrs,
      badgeIconSize,
      iconLoaded
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

.oc-resource-icon-status-badge {
  background: var(--oc-color-swatch-passive-hover);
  opacity: 0.9;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid var(--oc-color-background-default);
  border-radius: 30px;
  padding: 2px;

  .oc-icon {
    svg {
      fill: var(--oc-color-background-default) !important;
    }
  }
}
</style>

<template>
  <li v-oc-tooltip="componentProps.disabled ? action.disabledTooltip?.(actionOptions) : ''">
    <oc-button
      v-oc-tooltip="showTooltip || action.hideLabel ? action.label(actionOptions) : ''"
      :type="action.componentType"
      v-bind="componentProps"
      :class="[action.class, 'action-menu-item', 'oc-py-s', 'oc-px-m', 'oc-width-1-1']"
      :aria-label="componentProps.disabled ? action.disabledTooltip?.(actionOptions) : ''"
      data-testid="action-handler"
      :size="size"
      justify-content="left"
      v-on="componentListeners"
    >
      <oc-img
        v-if="action.img"
        data-testid="action-img"
        :src="action.img"
        alt=""
        class="oc-icon oc-icon-m"
      />
      <oc-img
        v-else-if="hasExternalImageIcon"
        data-testid="action-img"
        :src="action.icon"
        alt=""
        class="oc-icon oc-icon-m"
      />
      <oc-icon
        v-else-if="action.icon"
        data-testid="action-icon"
        :name="action.icon"
        :fill-type="action.iconFillType || 'line'"
        :size="size"
      />
      <span
        v-if="!action.hideLabel"
        class="oc-files-context-action-label oc-flex"
        data-testid="action-label"
      >
        <span v-text="action.label(actionOptions)" />
        <span
          v-if="action.showOpenInNewTabHint"
          class="oc-text-muted oc-text-xsmall"
          v-text="openInNewTabHint"
        />
      </span>
      <span
        v-if="action.shortcut && shortcutHint"
        class="oc-files-context-action-shortcut"
        v-text="action.shortcut"
      />
    </oc-button>
  </li>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, unref } from 'vue'
import { Action, ActionOptions, useConfigStore } from '../../composables'
import { useGettext } from 'vue3-gettext'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'ActionMenuItem',
  props: {
    action: {
      type: Object as PropType<Action>,
      required: true
    },
    actionOptions: {
      type: Object as PropType<ActionOptions>,
      required: true
    },
    size: {
      type: String,
      required: false,
      default: 'medium'
    },
    appearance: {
      type: String,
      default: 'raw'
    },
    variation: {
      type: String,
      default: 'passive'
    },
    shortcutHint: {
      type: Boolean,
      default: true,
      required: false
    },
    showTooltip: {
      type: Boolean,
      default: false,
      required: false
    }
  },
  setup(props) {
    const { $gettext } = useGettext()
    const configStore = useConfigStore()
    const { options } = storeToRefs(configStore)

    const componentProps = computed(() => {
      const properties = {
        appearance: props.action.appearance || props.appearance,
        variation: props.action.variation || props.variation,
        ...(props.action.isDisabled && {
          disabled: props.action.isDisabled(props.actionOptions)
        }),
        ...(props.action.id && { id: props.action.id })
      }

      if (props.action.componentType === 'router-link' && props.action.route) {
        return {
          ...properties,
          to: props.action.route(props.actionOptions),
          target: options.value.cernFeatures ? '_blank' : '_self'
        }
      }

      return properties
    })

    const isMacOs = computed(() => {
      return window.navigator.platform.match('Mac')
    })

    const openInNewTabHint = computed(() => {
      return $gettext(
        'Hold %{key} and click to open in new tab',
        { key: unref(isMacOs) ? '⌘' : 'ctrl' },
        true
      )
    })

    return {
      componentProps,
      openInNewTabHint
    }
  },
  computed: {
    hasExternalImageIcon() {
      return this.action.icon && /^https?:\/\//i.test(this.action.icon)
    },
    componentListeners() {
      if (typeof this.action.handler !== 'function' || this.action.componentType !== 'button') {
        return {}
      }

      const callback = () =>
        this.action.handler({
          ...this.actionOptions
        })
      if (this.action.keepOpen) {
        return {
          click: (event: Event) => {
            event.stopPropagation()
            callback()
          }
        }
      }
      return {
        click: callback
      }
    }
  }
})
</script>
<style lang="scss">
.action-menu-item {
  vertical-align: middle;
}

.oc-files-context-action-label {
  flex-direction: column;
}

.oc-files-context-action-shortcut {
  justify-content: right !important;
  font-size: var(--oc-font-size-small);
  font-weight: bold !important;
  opacity: 0.7;
}
</style>

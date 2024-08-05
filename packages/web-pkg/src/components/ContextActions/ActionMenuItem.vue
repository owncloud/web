<template>
  <li v-oc-tooltip="componentProps.disabled ? action.disabledTooltip?.(actionOptions) : ''">
    <oc-button
      v-oc-tooltip="showTooltip || action.hideLabel ? action.label(actionOptions) : ''"
      :type="action.componentType"
      v-bind="componentProps"
      :class="[action.class, 'action-menu-item', 'oc-py-s', 'oc-px-m', 'oc-width-1-1']"
      :aria-label="componentProps.disabled ? action.disabledTooltip?.(actionOptions) : ''"
      data-testid="action-handler"
      size="small"
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
        size="medium"
      />
      <span
        v-if="!action.hideLabel"
        class="oc-files-context-action-label oc-display-block"
        data-testid="action-label"
      >
        <span v-text="action.label(actionOptions)" />
        <span
          v-if="action.subtitle"
          class="oc-files-context-action-subtitle oc-text-muted oc-text-xsmall"
          v-text="action.subtitle(actionOptions)"
        />
      </span>
      <span
        v-if="action.shortcut && shortcutHint"
        class="oc-files-context-action-shortcut"
        v-text="action.shortcut"
      />
      <span
        v-if="action.opensInNewWindow"
        data-testid="action-sr-hint"
        class="oc-invisible-sr"
        v-text="$gettext('(Opens in new window)')"
      />
    </oc-button>
  </li>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { Action, ActionOptions } from '../../composables/actions'

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
          to: props.action.route(props.actionOptions)
        }
      }

      return properties
    })

    return {
      componentProps
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

      const callback = (event: MouseEvent) => {
        this.action.handler({
          ...this.actionOptions,
          newTab: event.altKey
        })
      }
      if (this.action.keepOpen) {
        return {
          click: (event: MouseEvent) => {
            event.stopPropagation()
            callback(event)
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

.oc-files-context-action-shortcut {
  justify-content: right !important;
  font-size: var(--oc-font-size-small);
  font-weight: bold !important;
  opacity: 0.7;
}
</style>

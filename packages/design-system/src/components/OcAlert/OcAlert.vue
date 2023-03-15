<template>
  <div
    v-if="!closed"
    class="oc-alert oc-position-relative"
    :class="[
      alertStyle,
      closeable ? 'oc-alert-closeable' : '',
      renderIcon ? 'oc-alert-has-icon' : ''
    ]"
    :aria-label="ariaLabel"
  >
    <oc-icon v-if="renderIcon" :name="icon" class="oc-alert-icon" :accessible-label="ariaLabel" />
    <oc-button
      v-if="closeable"
      size="small"
      type="button"
      appearance="raw"
      class="oc-alert-close-button"
      @click="close"
    >
      <oc-icon name="close" accessible-label="Close" />
    </oc-button>
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

/**
 * Alert is component to display a message to the user in various colors.
 */
export default defineComponent({
  name: 'OcAlert',
  status: 'ready',
  release: '2.0.0',
  components: {},
  props: {
    /**
     * Style of the alert:
     * - info: light blue background, blue color, renders as oc-alert-info; use for informational messages
     * - success: light green background, green color, renders as oc-alert-success, use for success messages
     * - warning: light yellow background, yellow color, renders as oc-alert-warning, use for warning messages
     * - danger: light red background, red color, renders as oc-alert-danger, use for error messages
     */
    variant: {
      type: String,
      default: 'info',
      validator(value: string) {
        // The value must match one of these strings
        return ['info', 'success', 'warning', 'danger'].includes(value)
      }
    },
    /**
     * Whether the alert can be closed or not
     */
    closeable: {
      type: Boolean,
      default: false
    },

    /**
     * Whether the alert has an icon or not. Icon is determined by the style prop.
     */
    hasIcon: {
      type: Boolean,
      default: false
    },

    /**
     * Custom Icon, if default icons are not suitable; if set icon gets rendered
     * regardless of hasIcon prop
     */
    customIcon: {
      type: String,
      default: ''
    },

    ariaLabel: {
      type: String,
      default: 'Alert'
    }
  },
  data() {
    return {
      closed: false
    }
  },
  computed: {
    alertStyle() {
      switch (this.variant) {
        case 'success':
          return 'oc-alert-success'
        case 'warning':
          return 'oc-alert-warning'
        case 'danger':
          return 'oc-alert-danger'
        case 'info':
        default:
          return 'oc-alert-info'
      }
    },
    icon() {
      if (this.customIcon) {
        return this.customIcon
      }

      switch (this.variant) {
        case 'success':
          return 'checkbox-circle'
        case 'warning':
          return 'error-warning'
        case 'danger':
          return 'close-circle'
        case 'info':
        default:
          return 'information'
      }
    },

    /**
     * Whether the alert has an icon or not. Icon is determined by the style prop.
     * If a custom Icon is used, it will always be rendered.
     */
    renderIcon() {
      if (this.customIcon) {
        return true
      }

      return this.hasIcon
    }
  },
  methods: {
    close() {
      this.closed = true
    }
  }
})
</script>

<style lang="scss">
.oc-alert {
  padding: var(--oc-space-small) var(--oc-space-medium);
  margin: var(--oc-space-medium) 0;
  border-radius: 6px;
  border-width: 1px;
  border-style: solid;

  &.oc-alert- {
    &info {
      background-color: var(--oc-color-background-highlight);
      color: var(--oc-color-swatch-primary-default);
      border-color: var(--oc-color-swatch-primary-default);

      svg,
      .oc-alert-close-button svg {
        fill: var(--oc-color-swatch-primary-default);
      }
    }

    &success {
      background-color: var(--oc-color-swatch-success-background);
      color: var(--oc-color-swatch-success-default);
      border-color: var(--oc-color-swatch-success-default);

      svg,
      .oc-alert-close-button svg {
        fill: var(--oc-color-swatch-success-default);
      }
    }

    &warning {
      background-color: var(--oc-color-swatch-warning-background);
      color: var(--oc-color-swatch-warning-default);
      border-color: var(--oc-color-swatch-warning-default);

      svg,
      .oc-alert-close-button svg {
        fill: var(--oc-color-swatch-warning-default);
      }
    }

    &danger {
      background-color: var(--oc-color-swatch-danger-background);
      color: var(--oc-color-swatch-danger-default);
      border-color: var(--oc-color-swatch-danger-default);

      svg,
      .oc-alert-close-button svg {
        fill: var(--oc-color-swatch-danger-default);
      }
    }

    &has-icon {
      display: flex;
      align-items: center;
      padding-left: var(--oc-space-large);

      .oc-alert-icon svg {
        position: absolute;
        left: var(--oc-space-small);
        top: var(--oc-space-small);
      }
    }

    &closeable {
      padding-right: var(--oc-space-large);
    }
  }

  .oc-alert-close-button {
    position: absolute;
    right: var(--oc-space-small);
    top: var(--oc-space-small);
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
  }
}
</style>

<docs>
```js
  <oc-alert :closeable="true" :hasIcon="true">
    I'm just an info message. I can be closed and have the default info icon.
  </oc-alert>
  <oc-alert :variant="'success'" :closeable="true" :hasIcon="true">
    Yay! Success! I can be closed and have the default success icon.
  </oc-alert>
  <oc-alert :variant="'warning'" :closeable="true">
    Hm there seems to be something wrong. I can be closed and have no icon.
  </oc-alert>
  <oc-alert :variant="'danger'" :hasIcon="true">
    WHAAA. PANIC! I can't be closed and have the default danger icon.
  </oc-alert>
  <oc-alert :variant="'danger'" customIcon="cloud-off" :closeable="true" :hasIcon="true">
    WHAAA. PANIC! With a custom Icon
  </oc-alert>
```
</docs>

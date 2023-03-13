<template>
  <div
    class="oc-alert oc-position-relative"
    :class="[
      alertStyle,
      closed ? 'oc-hidden' : '',
      closeable ? 'oc-alert-closeable' : '',
      renderIcon ? 'oc-alert-has-icon' : ''
    ]"
    :aria-label="ariaLabel"
    :data-test-user-name="alertStyle"
  >
    <OcIcon v-if="renderIcon" :name="icon" class="oc-alert-icon" :accessible-label="ariaLabel" />
    <OcButton
      v-if="closeable"
      size="small"
      type="button"
      appearance="raw"
      class="oc-alert-close-button"
      @click="close"
    >
      <OcIcon name="close" accessible-label="Close" />
    </OcButton>
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
  release: '1.0.0',
  components: {},
  props: {
    /**
     * Style of the alert:
     * - success: green background, green color, renders as oc-alert-success
     * - warning: yellow background, yellow color, renders as oc-alert-warning
     * - danger: red background, red color, renders as oc-alert-danger
     */
    style: {
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
     * Custom Icon, if default icons are not suitable
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
      switch (this.style) {
        case 'info':
          return 'oc-alert-info'
        case 'success':
          return 'oc-alert-success'
        case 'warning':
          return 'oc-alert-warning'
        case 'danger':
          return 'oc-alert-danger'
      }
    },
    icon() {
      if (this.customIcon) {
        return this.customIcon
      }

      switch (this.style) {
        case 'info':
          return 'information'
        case 'success':
          return 'checkbox-circle'
        case 'warning':
          return 'error-warning'
        case 'danger':
          return 'close-circle'
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

      svg {
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
  <OcAlert :closeable="true" :hasIcon="true">
    I'm just an info message. I can be closed and have the default info icon.
  </OcAlert>
  <OcAlert :style="'success'" :closeable="true" :hasIcon="true">
    Yay! Success! I can be closed and have the default success icon.
  </OcAlert>
  <OcAlert :style="'warning'" :closeable="true">
    Hm there seems to be something wrong. I can be closed and have no icon.
  </OcAlert>
  <OcAlert :style="'danger'" :hasIcon="true">
    WHAAA. PANIC! I can't be closed and have the default danger icon.
  </OcAlert>
  <OcAlert :style="'danger'" customIcon="cloud-off" :closeable="true" :hasIcon="true">
    WHAAA. PANIC! With a custom Icon
  </OcAlert>
```
</docs>

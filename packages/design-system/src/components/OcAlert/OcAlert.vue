<template>
  <div
    v-show="!dismissed"
    class="oc-alert oc-position-relative"
    :class="[
      alertStyles[variant],
      dismissable ? 'oc-alert-dismissable' : '',
      renderIcon ? 'oc-alert-has-icon' : ''
    ]"
    :aria-label="ariaLabel"
  >
    <div class="oc-alert-title">
      <oc-icon
        v-if="renderIcon"
        :name="icon"
        class="oc-alert-icon oc-mr-s"
        :accessible-label="ariaLabel"
      />
      <oc-button
        v-if="dismissable"
        size="small"
        type="button"
        appearance="raw"
        class="oc-alert-close-button"
        @click="dismiss"
      >
        <oc-icon name="close" accessible-label="Close" />
      </oc-button>
      <slot />
    </div>
    <div class="oc-alert-message oc-mt-s oc-pt-s">
      <slot name="message" />
    </div>
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
  release: '2.0.1',
  components: {},
  props: {
    variant: {
      type: String,
      default: 'info',
      validator(value: string) {
        return ['info', 'success', 'warning', 'danger'].includes(value)
      }
    },
    dismissable: {
      type: Boolean,
      default: false
    },

    /**
     * Whether the alert has an icon or not. Icon is determined by the `variant` prop.
     */
    hasIcon: {
      type: Boolean,
      default: true
    },

    /**
     * Pass custom icon name to use instead of the default one.
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
  emits: ['dismissed'],
  data() {
    return {
      dismissed: false
    }
  },
  computed: {
    alertStyles() {
      return {
        info: 'oc-alert-info',
        success: 'oc-alert-success',
        warning: 'oc-alert-warning',
        danger: 'oc-alert-danger'
      }
    },
    icon() {
      if (this.customIcon) {
        return this.customIcon
      }
      return {
        info: 'information',
        success: 'checkbox-circle',
        warning: 'error-warning',
        danger: 'close-circle'
      }[this.variant]
    },
    renderIcon() {
      if (this.customIcon) {
        return true
      }
      return this.hasIcon
    }
  },
  methods: {
    dismiss() {
      this.dismissed = true
      this.$emit('dismissed')
    }
  }
})
</script>

<style lang="scss">
.oc-alert {
  padding: var(--oc-space-small) var(--oc-space-medium) var(--oc-space-small) var(--oc-space-small);
  margin: var(--oc-space-medium) 0;
  border-radius: 6px;
  border-width: 1px;
  border-style: solid;

  .oc-alert-message {
    display: block;
    border-top: 1px solid var(--oc-color-swatch-primary-default);
    font-size: 1rem;
    line-height: 1.75;

    &:empty {
      display: none;
    }
  }

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
      .oc-alert-title {
        display: flex;
        align-items: center;
      }
    }

    &dismissable > .oc-alert-title {
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
  <oc-alert :dismissable="true" :hasIcon="true">
    I'm just an info message. I can be closed and have the default info icon.
  </oc-alert>
  <oc-alert :dismissable="true" :hasIcon="true">
    I'm just an info message. I can be closed and have the default info icon.
    <template #message>
      <p>And I have a custom message, which can be multiline or multipart. It acts as alert body - contents are passed via named slot</p>
    </template>
  </oc-alert>
  <oc-alert :variant="'success'" :dismissable="true" :hasIcon="true">
    Yay! Success! I can be closed and have the default success icon.
  </oc-alert>
  <oc-alert :variant="'warning'" :dismissable="true">
    Hm there seems to be something wrong. I can be closed and have no icon.
  </oc-alert>
  <oc-alert :variant="'danger'" :hasIcon="true">
    WHAAA. PANIC! I can't be closed and have the default danger icon.
  </oc-alert>
  <oc-alert :variant="'danger'" customIcon="cloud-off" :dismissable="true" :hasIcon="true">
    WHAAA. PANIC! With a custom Icon
  </oc-alert>
```
</docs>

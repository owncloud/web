<template>
  <oc-alert
    class="oc-fade-in oc-box-shadow-medium"
    :closeable="true"
    :has-icon="true"
    :role="role"
    :aria-live="ariaLive"
    :variant="status"
  >
    {{ title }}
    <template #message>
      {{ message }}
    </template>
  </oc-alert>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

/**
 * Notifications are used to inform users about errors, warnings and as confirmations for their actions.
 */
export default defineComponent({
  name: 'OcNotificationMessage',
  status: 'ready',
  release: '1.0.0',
  props: {
    /**
     * Notification messages are sub components of the oc-notifications component.
     * Messages can have one of the five states: `passive, primary, success, warning and danger`
     *
     * The status defines the color of the notification.
     */
    status: {
      type: String,
      required: false,
      default: 'info',
      validator: (value: string) => {
        return ['info', 'success', 'warning', 'danger'].includes(value)
      }
    },
    /**
     * The title that will be displayed in notification
     */
    title: {
      type: String,
      required: true
    },
    /**
     * The message that will be displayed in notification
     */
    message: {
      type: String,
      required: false,
      default: null
    },
    /**
     * Number of seconds the message shows. It will disappear after this time.
     */
    timeout: {
      type: Number,
      required: false,
      default: 5,
      validator: (value: number) => value > 0
    }
  },
  emits: ['close'],
  computed: {
    classes() {
      return `oc-notification-message-${this.status}`
    },
    iconVariation() {
      return this.status
    },
    isStatusDanger() {
      return this.status === 'danger'
    },
    role() {
      return this.isStatusDanger ? 'alert' : 'status'
    },
    ariaLive() {
      return this.isStatusDanger ? 'assertive' : 'polite'
    }
  },
  mounted() {
    /**
     * Notification will be destroyed if timeout is set
     */
    setTimeout(() => {
      this.close()
    }, this.timeout * 1000)
  },
  methods: {
    close() {
      /**
       * The close event is emitted when the user clicks the close icon.
       * @type {void}
       */
      this.$emit('close')
    }
  }
})
</script>

<style lang="scss">
.oc-notification-message {
  margin-top: var(--oc-space-small);
  position: relative;
  word-break: break-word;
}
</style>

<docs>
  Please have a look at the component [OcNotifications](#/oC%20Components/OcNotifications) for example code.
</docs>

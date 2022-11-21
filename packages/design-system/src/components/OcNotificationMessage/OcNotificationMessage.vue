<template>
  <div
    class="oc-fade-in oc-flex oc-flex-wrap oc-notification-message oc-box-shadow-medium oc-rounded oc-p-m"
    :class="classes"
  >
    <div class="oc-flex oc-flex-wrap oc-flex-middle oc-flex-1" :role="role" :aria-live="ariaLive">
      <div class="oc-flex oc-flex-middle">
        <oc-icon :variation="iconVariation" name="information" fill-type="line" class="oc-mr-s" />
        <div class="oc-notification-message-title">
          {{ title }}
        </div>
      </div>
      <div
        v-if="message"
        class="oc-text-muted oc-width-1-1 oc-notification-message-content oc-mt-s oc-pl-s oc-ml-l"
      >
        {{ message }}
      </div>
    </div>
  </div>
</template>
<script>
import OcIcon from '../OcIcon/OcIcon.vue'

/**
 * Notifications are used to inform users about errors, warnings and as confirmations for their actions.
 */
export default {
  name: 'OcNotificationMessage',
  status: 'ready',
  release: '1.0.0',
  components: {
    OcIcon
  },
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
      default: 'passive',
      validator: (value) => {
        return value.match(/(passive|primary|success|warning|danger)/)
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
      validator: (value) => value > 0
    }
  },
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
}
</script>

<style lang="scss">
.oc-notification-message {
  background-color: var(--oc-color-background-default) !important;
  cursor: pointer;
  margin-top: var(--oc-space-small);
  position: relative;
  word-break: break-word;

  &-title {
    font-size: 1.15rem;
  }
}
</style>

<docs>
  Please have a look at the component [OcNotifications](#/oC%20Components/OcNotifications) for example code.
</docs>

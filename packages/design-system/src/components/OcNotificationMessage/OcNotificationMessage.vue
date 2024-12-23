<template>
  <div
    class="oc-fade-in oc-flex oc-flex-wrap oc-notification-message oc-box-shadow-medium oc-rounded oc-p-m"
    :class="classes"
  >
    <div class="oc-flex oc-flex-wrap oc-flex-middle oc-flex-1" :role="role" :aria-live="ariaLive">
      <div class="oc-flex oc-flex-middle oc-flex-between oc-width-1-1">
        <div class="oc-flex oc-flex-middle">
          <oc-icon :variation="iconVariation" name="information" fill-type="line" class="oc-mr-s" />
          <div class="oc-notification-message-title">
            {{ title }}
          </div>
        </div>
        <oc-button appearance="raw" :aria-label="$gettext('Close')" @click="close"
          ><oc-icon name="close"
        /></oc-button>
      </div>
      <div v-if="message || errorLogContent" class="oc-flex oc-flex-between oc-width-1-1 oc-mt-s">
        <span
          v-if="message"
          class="oc-notification-message-content oc-text-muted oc-mr-s"
          v-text="message"
        />
        <oc-button
          v-if="errorLogContent"
          class="oc-notification-message-error-log-toggle-button"
          gap-size="none"
          appearance="raw"
          @click="showErrorLog = !showErrorLog"
        >
          <span v-text="$gettext('Details')"></span>
          <oc-icon :name="showErrorLog ? 'arrow-up-s' : 'arrow-down-s'" />
        </oc-button>
      </div>
      <oc-error-log v-if="showErrorLog" class="oc-mt-m" :content="errorLogContent" />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue'
import OcIcon from '../OcIcon/OcIcon.vue'
import OcButton from '../OcButton/OcButton.vue'
import OcErrorLog from '../OcErrorLog/OcErrorLog.vue'

/**
 * Notifications are used to inform users about errors, warnings and as confirmations for their actions.
 */
export default defineComponent({
  name: 'OcNotificationMessage',
  status: 'ready',
  release: '1.0.0',
  components: {
    OcErrorLog,
    OcIcon,
    OcButton
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
      validator: (value: string) => {
        return ['passive', 'primary', 'success', 'warning', 'danger'].includes(value)
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
     * The error log content that will be displayed in notification
     */
    errorLogContent: {
      type: String,
      required: false,
      default: null
    },
    /**
     * Number of seconds the message shows. It will disappear after this time.
     * If set to 0, message won't disappear automatically.
     */
    timeout: {
      type: Number,
      required: false,
      default: 5,
      validator: (value: number) => value > 0
    }
  },
  emits: ['close'],
  setup: function () {
    const showErrorLog = ref(false)

    return {
      showErrorLog
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
    if (this.timeout !== 0) {
      setTimeout(() => {
        this.close()
      }, this.timeout * 1000)
    }
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
  background-color: var(--oc-color-background) !important;
  margin-top: var(--oc-space-small);
  position: relative;
  word-break: break-word;

  &-title {
    font-size: 1.15rem;
  }

  &-error-log-toggle-button {
    word-break: keep-all;
  }
}
</style>

<docs>
  Please have a look at the component [OcNotifications](#/oC%20Components/OcNotifications) for example code.
</docs>

<template>
  <div
    class="oc-fade-in oc-flex oc-flex-wrap oc-notification-message oc-box-shadow-medium oc-rounded oc-p-m"
    :class="classes"
  >
    <div class="oc-flex oc-flex-wrap oc-flex-middle oc-flex-1" :role="role" :aria-live="ariaLive">
      <div class="oc-flex oc-flex-middle oc-flex-between oc-width-1-1">
        <div class="oc-flex">
          <oc-icon :variation="iconVariation" name="information" fill-type="line" class="oc-mr-s" />
          <div class="oc-notification-message-title">
            {{ title }}
          </div>
        </div>
        <oc-button appearance="raw" @click="close"><oc-icon name="close" /></oc-button>
      </div>
      <div class="oc-width-1-1 oc-notification-message-content">
        <div class="oc-flex oc-flex-between oc-width-1-1 oc-mt-s">
          <span class="oc-mr-s" v-text="message" />
          <oc-button
            v-if="errorDescription"
            class="oc-notification-message-error-description-toggle-button"
            gap-size="none"
            appearance="raw"
            @click="showErrorDescription = !showErrorDescription"
          >
            <span v-text="$gettext('Details')"></span>
            <oc-icon :name="showErrorDescription ? 'arrow-up-s' : 'arrow-down-s'"
          /></oc-button>
        </div>
        <div class="oc-mt-l" v-if="showErrorDescription">
          <oc-textarea
            class="oc-mt-s oc-notification-message-error-description-textarea"
            :label="errorDescriptionLabel"
            :model-value="errorDescription"
            rows="4"
            readonly
          />
          <oc-button
            class="oc-width-1-1 oc-mt-xs"
            size="small"
            variation="primary"
            appearance="filled"
            v-text="$gettext('Copy')"
            @click="copyErrorDescriptionToClipboard"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { useGettext } from 'vue3-gettext'
import OcIcon from '../OcIcon/OcIcon.vue'
import OcButton from '../OcButton/OcButton.vue'

/**
 * Notifications are used to inform users about errors, warnings and as confirmations for their actions.
 */
export default defineComponent({
  name: 'OcNotificationMessage',
  status: 'ready',
  release: '1.0.0',
  components: {
    OcIcon,
    OcButton
  },
  setup: function (props) {
    const { $gettext } = useGettext()
    const showErrorDescription = ref(false)

    const errorDescriptionLabel = computed(() => {
      return $gettext(
        'Copy the following information to pass them to technical support to troubleshoot the problem:'
      )
    })

    const copyErrorDescriptionToClipboard = () => {
      navigator.clipboard.writeText(props.errorDescription)
    }

    return {
      errorDescriptionLabel,
      showErrorDescription,
      copyErrorDescriptionToClipboard
    }
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
      default: 'Dödelerror'
    },
    /**
     * The error description that will be displayed in notification
     */
    errorDescription: {
      type: String,
      required: false,
      default: 'hello'
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
    /*setTimeout(() => {
      this.close()
    }, this.timeout * 1000)
     */
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
  background-color: var(--oc-color-background-default) !important;
  margin-top: var(--oc-space-small);
  position: relative;
  word-break: break-word;

  &-title {
    font-size: 1.15rem;
  }

  &-error-description {
    &-toggle-button {
      word-break: keep-all;
    }

    &-textarea {
      resize: none;

      label {
        color: var(--oc-color-text-muted);
      }
    }
  }
}
</style>

<docs>
  Please have a look at the component [OcNotifications](#/oC%20Components/OcNotifications) for example code.
</docs>

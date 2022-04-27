<template>
  <oc-button
    v-oc-tooltip="label"
    :aria-label="label"
    appearance="raw"
    :variation="copied ? 'success' : 'passive'"
    @click="copyValueToClipboard"
  >
    <span v-text="text" />
    <oc-icon
      v-if="copied"
      key="oc-copy-to-clipboard-copied"
      name="checkbox-circle"
      class="_clipboard-success-animation"
    />
    <oc-icon v-else key="oc-copy-to-clipboard-copy" name="clipboard" />
  </oc-button>
</template>

<script>
import { mapActions } from 'vuex'
import copyToClipboard from 'copy-to-clipboard'

export default {
  props: {
    text: {
      type: String,
      required: false,
      default: ''
    },
    /**
     * Content which is to be copied to the clipboard
     */
    value: {
      type: String,
      required: true
    },
    /**
     * Tooltip and aria-label for the button (describing the action, e.g. "Copy link to clipboard")
     */
    label: {
      type: String,
      required: true
    },
    /**
     * Title for the success message toast
     */
    successMsgTitle: {
      type: String,
      required: true
    },
    /**
     * Content for the success message toast
     */
    successMsgText: {
      type: String,
      required: true
    }
  },
  data: () => ({
    copied: false,
    timeout: null
  }),
  methods: {
    ...mapActions(['showMessage']),
    copyValueToClipboard() {
      copyToClipboard(this.value)
      this.clipboardSuccessHandler()
      this.showMessage({
        title: this.successMsgTitle,
        desc: this.successMsgText
      })
    },
    clipboardSuccessHandler() {
      this.copied = true
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        this.copied = false
      }, 550)
    }
  }
}
</script>

<style scoped>
._clipboard-success-animation {
  animation-name: _clipboard-success-animation;
  animation-duration: 0.8s;
  animation-timing-function: ease-out;
  animation-fill-mode: both;
}

@keyframes _clipboard-success-animation {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.9;
  }
  100% {
    opacity: 0;
  }
}
</style>

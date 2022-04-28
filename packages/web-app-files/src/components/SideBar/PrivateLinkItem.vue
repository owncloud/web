<template>
  <oc-button
    v-oc-tooltip="copyToClipboardLabel"
    class="oc-files-private-link-copy-url"
    :aria-label="copyToClipboardLabel"
    appearance="raw"
    :variation="copied ? 'success' : 'passive'"
    @click="copyValueToClipboard"
  >
    <span v-text="copyToClipboardText" />
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
  name: 'PrivateLinkItem',
  inject: ['displayedItem'],
  data: () => ({
    copied: false,
    timeout: null
  }),
  computed: {
    link() {
      return this.displayedItem.value.privateLink
    },
    copyToClipboardText() {
      return this.$gettext('Private link')
    },
    copyToClipboardLabel() {
      return this.$gettext('Copy private link to clipboard')
    }
  },
  methods: {
    ...mapActions(['showMessage']),
    copyValueToClipboard() {
      copyToClipboard(this.displayedItem.value)
      this.clipboardSuccessHandler()
      this.showMessage({
        title: this.$gettext('Private link copied'),
        desc: this.$gettext('The private link has been copied to your clipboard.')
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

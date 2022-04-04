<template>
  <copy-to-clipboard-button
    class="oc-files-private-link-copy-url"
    :value="link"
    :label="copyToClipboardLabel"
    :text="copyToClipboardText"
    :success-msg-title="copyToClipboardSuccessMsgTitle"
    :success-msg-text="copyToClipboardSuccessMsgText"
  />
</template>

<script>
import CopyToClipboardButton from './Shared/CopyToClipboardButton.vue'

export default {
  name: 'PrivateLinkItem',
  components: { CopyToClipboardButton },
  inject: ['displayedItem'],
  computed: {
    link() {
      return this.displayedItem.value.privateLink
    },
    copyToClipboardText() {
      return this.$gettext('Private link')
    },
    copyToClipboardLabel() {
      return this.$gettext('Copy private link to clipboard')
    },
    copyToClipboardSuccessMsgTitle() {
      return this.$gettext('Private link copied')
    },
    copyToClipboardSuccessMsgText() {
      return this.$gettext('The private link has been copied to your clipboard.')
    }
  }
}
</script>

<template>
  <div class="oc-files-private-link-item" data-testid="files-sidebar-private-link">
    <h4 v-translate class="oc-text-bold oc-m-rm oc-text-initial">Private Link</h4>
    <p v-translate class="oc-text-muted oc-my-rm">Only invited people can use this link.</p>
    <div class="uk-width-1-1 uk-flex uk-flex-middle">
      <a :href="link" target="_blank" class="uk-text-truncate" v-text="link" />
      <copy-to-clipboard-button
        class="oc-files-private-link-copy-url oc-ml-xs"
        :value="link"
        :label="copyToClipboardLabel"
        :success-msg-title="copyToClipboardSuccessMsgTitle"
        :success-msg-text="copyToClipboardSuccessMsgText"
      />
    </div>
    <hr />
  </div>
</template>

<script>
import CopyToClipboardButton from './CopyToClipboardButton.vue'

export default {
  name: 'PrivateLinkItem',
  components: { CopyToClipboardButton },

  inject: ['displayedItem'],

  computed: {
    link() {
      const file = this.displayedItem.value

      if (file.isMounted()) {
        const file = encodeURIComponent(this.file.name)

        return window.location.href.split('?')[0] + `?scrollTo=${file}`
      }

      return file.privateLink
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

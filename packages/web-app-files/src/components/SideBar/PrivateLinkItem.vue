<template>
  <oc-button
    v-oc-tooltip="buttonLabel"
    appearance="raw"
    :aria-label="buttonLabel"
    class="oc-files-private-link-copy-url"
    :variation="copied ? 'success' : 'passive'"
    @click="copyPrivateLinkToClipboard"
  >
    <span v-text="buttonText" />
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
import { unref } from '@vue/composition-api'

export default {
  name: 'PrivateLinkItem',
  inject: ['displayedItem'],
  data: () => ({
    copied: false,
    timeout: null
  }),
  computed: {
    buttonText() {
      return this.$gettext('Private link')
    },
    buttonLabel() {
      return this.$gettext('Copy private link to clipboard')
    }
  },
  methods: {
    ...mapActions(['showMessage']),
    copyPrivateLinkToClipboard() {
      copyToClipboard(unref(this.displayedItem).privateLink)
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

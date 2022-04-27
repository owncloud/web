<template>
  <div class="oc-mb-s oc-width-1-1">
    <h4 class="oc-text-truncate oc-files-file-link-name oc-my-s" v-text="linkName" />
    <div class="oc-flex oc-flex-middle oc-flex-between oc-width-1-1 oc-p-s link-name-container">
      <div class="oc-flex oc-flex-middle oc-text-truncate">
        <oc-icon name="link" fill-type="line" />
        <p class="oc-files-file-link-url oc-ml-s oc-text-truncate oc-my-rm" v-text="link.url" />
      </div>
      <copy-to-clipboard-button
        class="oc-files-public-link-copy-url"
        :value="link.url"
        :label="copyToClipboardLabel"
        :success-msg-title="copyToClipboardSuccessMsgTitle"
        :success-msg-text="getCopyToClipboardSuccessMsgText(linkName)"
      />
    </div>
  </div>
</template>

<script>
import CopyToClipboardButton from '../../Shared/CopyToClipboardButton.vue'

export default {
  name: 'NameAndCopy',
  components: { CopyToClipboardButton },
  props: {
    link: {
      type: Object,
      required: true
    }
  },
  computed: {
    linkName() {
      return this.link.name
    },

    copyToClipboardLabel() {
      return this.$gettext('Copy link to clipboard')
    },

    copyToClipboardSuccessMsgTitle() {
      return this.$gettext('Link copied')
    }
  },
  methods: {
    getCopyToClipboardSuccessMsgText(linkName) {
      return this.$gettextInterpolate(
        this.$gettext('The link "%{linkName}" has been copied to your clipboard.'),
        {
          linkName
        },
        true
      )
    }
  }
}
</script>

<style scoped>
.link-name-container {
  background-color: var(--oc-color-input-bg);
  border: 1px solid var(--oc-color-input-border);
}
</style>

<template>
  <div v-if="privateLinkEnabled">
    <h4 v-translate class="oc-text-bold oc-m-rm oc-text-initial">Private Link</h4>
    <p v-translate class="oc-text-muted oc-my-rm">Only invited people can use this link.</p>
    <div class="uk-width-1-1 uk-flex uk-flex-middle">
      <a :href="link" target="_blank" class="uk-text-truncate" v-text="link" />
      <oc-button :aria-label="copyLabel" :uk-tooltip="copyLabel" appearance="raw" class="oc-ml-s">
        <oc-icon
          v-if="linkCopied"
          id="files-sidebar-private-link-icon-copied"
          key="private-link-copy-icon-copied"
          name="ready"
          class="_clipboard-success-animation"
        />
        <oc-icon
          v-else
          id="files-sidebar-private-link-label"
          key="private-link-copy-icon"
          v-clipboard:copy="link"
          v-clipboard:success="clipboardSuccessHandler"
          name="copy_to_clipboard"
        />
      </oc-button>
    </div>
    <hr />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'PrivateLinkItem',

  data: () => ({
    linkCopied: false
  }),

  computed: {
    ...mapGetters('Files', ['highlightedFile']),
    ...mapGetters(['capabilities']),

    copyLabel() {
      return this.$gettext('Copy private link url')
    },

    link() {
      if (this.highlightedFile.isMounted()) {
        const file = encodeURIComponent(this.highlightedFile.name)

        return window.location.href.split('?')[0] + `?scrollTo=${file}`
      }

      return this.highlightedFile.privateLink
    },

    privateLinkEnabled() {
      return this.capabilities.files.privateLinks
    }
  },

  methods: {
    clipboardSuccessHandler() {
      this.linkCopied = true

      setTimeout(() => {
        this.linkCopied = false
      }, 550)
    }
  }
}
</script>

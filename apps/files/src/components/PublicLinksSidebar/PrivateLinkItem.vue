<template>
  <section>
    <div class="oc-text-bold uk-flex">
      <translate>Private Link</translate>
      <oc-button :aria-label="copyLabel" :uk-tooltip="copyLabel" variation="raw" class="oc-ml-s">
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
    <div class="uk-text-meta">
      <translate tag="i">Only invited people can use this link.</translate>
    </div>
    <hr />
  </section>
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

    copyLabel() {
      return this.$gettext('Copy private link url')
    },

    link() {
      if (this.highlightedFile.isMounted()) {
        const file = encodeURIComponent(this.highlightedFile.name)

        return window.location.href.split('?')[0] + `?scrollTo=${file}`
      }

      return this.highlightedFile.privateLink
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

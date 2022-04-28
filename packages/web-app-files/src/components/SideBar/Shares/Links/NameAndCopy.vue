<template>
  <div class="oc-mb-s oc-width-1-1">
    <h4 class="oc-text-truncate oc-files-file-link-name oc-my-s" v-text="linkName" />
    <div class="oc-flex oc-flex-middle oc-flex-between oc-width-1-1 oc-p-s link-name-container">
      <div v-if="copied" class="oc-flex oc-flex-middle oc-text-truncate">
        <oc-icon variation="success" name="checkbox-circle" />
        <p class="oc-files-file-link-url url-copied oc-ml-s oc-my-rm" v-text="copiedLabel" />
      </div>
      <div v-else class="oc-flex oc-flex-middle oc-text-truncate">
        <oc-icon name="link" fill-type="line" />
        <p class="oc-files-file-link-url oc-ml-s oc-text-truncate oc-my-rm" v-text="link.url" />
      </div>
      <oc-button
        v-oc-tooltip="copyToClipboardLabel"
        appearance="raw"
        :aria-label="copyToClipboardLabel"
        class="oc-files-public-link-copy-url"
        @click="copyToClipBoardMethod"
        v-text="copyLabel"
      />
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import copyToClipboard from 'copy-to-clipboard'

export default {
  name: 'NameAndCopy',
  props: {
    link: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    copied: false,
    timeout: null
  }),
  computed: {
    linkName() {
      return this.link.name
    },
    copyLabel() {
      return this.$gettext('Copy')
    },
    copiedLabel() {
      return this.$gettext('Copied')
    },
    getCopyToClipboardSuccessMsgText() {
      return this.$gettextInterpolate(
        this.$gettext('The link "%{linkName}" has been copied to your clipboard.'),
        {
          linkName: this.linkName
        },
        true
      )
    },
    copyToClipboardLabel() {
      return this.$gettext('Copy link to clipboard')
    }
  },
  methods: {
    ...mapActions(['showMessage']),
    copyToClipBoardMethod() {
      copyToClipboard(this.link.url)
      this.clipboardSuccessHandler()
      this.showMessage({
        title: this.$gettext('Link copied')
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
.link-name-container {
  background-color: var(--oc-color-input-bg);
  border: 1px solid var(--oc-color-input-border);
}

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

<template>
  <div class="oc-mb-s oc-width-1-1">
    <h4 v-if="linkName" class="oc-text-truncate oc-text-normal oc-files-file-link-name oc-m-rm" v-text="linkName" />
    <div class="oc-flex oc-flex-middle oc-flex-between oc-width-1-1 oc-p-s link-name-container">
      <div v-if="copied" class="oc-flex oc-flex-middle oc-text-truncate">
        <oc-icon variation="success" name="checkbox-circle" />
        <p class="oc-files-file-link-url url-copied oc-ml-s oc-my-rm" v-text="copiedLabel" />
      </div>
      <div v-else class="oc-flex oc-flex-middle oc-text-truncate">
        <oc-icon name="link" fill-type="line" />
        <p
          v-oc-tooltip="link.url"
          class="oc-files-file-link-url oc-ml-s oc-text-truncate oc-my-rm"
          v-text="link.url"
        />
      </div>
      <oc-button
        v-oc-tooltip="copyBtnHint"
        appearance="raw"
        :aria-label="copyBtnHint"
        class="oc-files-public-link-copy-url"
        @click="copyLinkToClipboard"
        v-text="copyBtnLabel"
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
    copyBtnLabel() {
      return this.$gettext('Copy')
    },
    copyBtnHint() {
      return this.$gettext('Copy link to clipboard')
    },
    copiedLabel() {
      return this.$gettext('Copied')
    }
  },
  methods: {
    ...mapActions(['showMessage']),
    copyLinkToClipboard() {
      copyToClipboard(this.link.url)
      this.clipboardSuccessHandler()
      this.showMessage({
        title: this.link.quicklink
          ? this.$gettext('The quicklink has been copied to your clipboard.')
          : this.$gettextInterpolate(
              this.$gettext('The link "%{linkName}" has been copied to your clipboard.'),
              {
                linkName: this.linkName
              },
              true
            )
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

<style lang="scss" scoped>
.url-copied {
  color: var(--oc-color-swatch-success-default);
}
</style>

<template>
  <div class="oc-mb-s oc-width-1-1">
    <h4 class="oc-text-truncate oc-text-normal oc-files-file-link-name oc-m-rm" v-text="linkName" />
    <div class="oc-flex oc-flex-middle oc-flex-between oc-width-1-1 oc-p-xs link-name-container">
      <div v-if="copied" class="oc-flex oc-flex-middle oc-text-truncate">
        <oc-icon variation="success" name="checkbox-circle" />
        <p class="oc-files-file-link-url url-copied oc-ml-s oc-my-rm" v-text="copiedLabel" />
      </div>
      <div v-else class="oc-flex oc-flex-middle oc-text-truncate">
        <oc-icon name="link" fill-type="line" />
        <p
          v-oc-tooltip="linkShare.link.webUrl"
          class="oc-files-file-link-url oc-ml-s oc-text-truncate oc-my-rm"
          v-text="linkShare.link.webUrl"
        />
      </div>
      <oc-button
        v-if="isClipboardCopySupported"
        v-oc-tooltip="copyBtnHint"
        :aria-label="copyBtnHint"
        size="small"
        class="oc-files-public-link-copy-url oc-ml-xs"
        @click="copyLinkToClipboard"
      >
        {{ copyBtnLabel }}
      </oc-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useMessages } from '@ownclouders/web-pkg'
import { useClipboard } from '@vueuse/core'
import { useGettext } from 'vue3-gettext'
import { LinkShare } from '@ownclouders/web-client/src/helpers'
import { PropType } from 'vue'

export default defineComponent({
  name: 'NameAndCopy',
  props: {
    linkShare: {
      type: Object as PropType<LinkShare>,
      required: true
    }
  },
  setup(props) {
    const { $gettext } = useGettext()
    const { showMessage } = useMessages()

    const {
      copy,
      copied,
      isSupported: isClipboardCopySupported
    } = useClipboard({ legacy: true, copiedDuring: 550 })

    const copyLinkToClipboard = () => {
      copy(props.linkShare.link.webUrl)
      showMessage({
        title: props.linkShare.link['@libre.graph.quickLink']
          ? $gettext('The link has been copied to your clipboard.')
          : $gettext('The link "%{linkName}" has been copied to your clipboard.', {
              linkName: props.linkShare.link['@libre.graph.displayName']
            })
      })
    }

    return {
      copied,
      copyLinkToClipboard,
      isClipboardCopySupported
    }
  },
  computed: {
    linkName() {
      return this.linkShare.link['@libre.graph.displayName']
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
  }
})
</script>

<style lang="scss" scoped>
.url-copied {
  color: var(--oc-color-swatch-success-default);
}
</style>

<template>
  <div class="oc-mb-s oc-width-1-1">
    <h4 class="oc-text-normal oc-m-rm oc-flex oc-flex-column">
      <span class="oc-text-truncate oc-files-file-link-name" v-text="linkName" />
      <span
        class="oc-text-small oc-text-muted oc-my-xs oc-invisible-sr"
        v-text="linkCreationDate"
      />
    </h4>
    <div class="oc-flex oc-flex-middle oc-flex-between oc-width-1-1 oc-p-xs link-name-container">
      <div v-if="copied" class="oc-flex oc-flex-middle oc-text-truncate">
        <oc-icon variation="success" name="checkbox-circle" />
        <p class="oc-files-file-link-url url-copied oc-ml-s oc-my-rm" v-text="copiedLabel" />
      </div>
      <div v-else class="oc-flex oc-flex-middle oc-text-truncate">
        <oc-icon name="link" fill-type="line" />
        <p
          v-oc-tooltip="linkShare.webUrl"
          class="oc-files-file-link-url oc-ml-s oc-text-truncate oc-my-rm"
          v-text="linkShare.webUrl"
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
import { computed, defineComponent, PropType } from 'vue'
import { formatDateFromISO, useMessages } from '@ownclouders/web-pkg'
import { useClipboard } from '@vueuse/core'
import { useGettext } from 'vue3-gettext'
import { LinkShare } from '@ownclouders/web-client'
import { DateTime } from 'luxon'

export default defineComponent({
  name: 'NameAndCopy',
  props: {
    linkShare: {
      type: Object as PropType<LinkShare>,
      required: true
    }
  },
  setup(props) {
    const { $gettext, current: currentLanguage } = useGettext()
    const { showMessage } = useMessages()

    const {
      copy,
      copied,
      isSupported: isClipboardCopySupported
    } = useClipboard({ legacy: true, copiedDuring: 550 })

    const linkCreationDate = computed(() => {
      return formatDateFromISO(
        props.linkShare.createdDateTime,
        currentLanguage,
        DateTime.DATETIME_MED
      )
    })

    const copyLinkToClipboard = () => {
      copy(props.linkShare.webUrl)
      showMessage({
        title: props.linkShare.isQuickLink
          ? $gettext('The link has been copied to your clipboard.')
          : $gettext('The link "%{linkName}" has been copied to your clipboard.', {
              linkName: props.linkShare.displayName
            })
      })
    }

    return {
      copied,
      copyLinkToClipboard,
      isClipboardCopySupported,
      linkCreationDate
    }
  },
  computed: {
    linkName() {
      return this.linkShare.displayName
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

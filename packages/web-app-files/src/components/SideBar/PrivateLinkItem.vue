<template>
  <oc-button
    v-if="isClipboardCopySupported"
    v-oc-tooltip="buttonLabel"
    appearance="raw"
    :aria-label="buttonLabel"
    class="oc-files-private-link-copy-url"
    :variation="copied ? 'success' : 'passive'"
    @click="copyLinkToClipboard"
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

<script lang="ts">
import { computed, defineComponent, inject, unref } from 'vue'
import { useClipboard } from '@vueuse/core'
import { Resource } from 'web-client'
import { useStore, useTranslations } from 'web-pkg/src'

export default defineComponent({
  name: 'PrivateLinkItem',
  setup() {
    const { $gettext } = useTranslations()
    const store = useStore<any>()
    const displayedItem = inject<Resource>('displayedItem')
    const privateLink = computed(() => unref(displayedItem))

    const {
      copy,
      copied,
      isSupported: isClipboardCopySupported
    } = useClipboard({ legacy: true, copiedDuring: 550 })

    const copyLinkToClipboard = () => {
      copy(privateLink.value.privateLink)
      store.dispatch('showMessage', {
        title: $gettext('Private link copied'),
        desc: $gettext('The private link has been copied to your clipboard.')
      })
    }

    return {
      copied,
      copyLinkToClipboard,
      isClipboardCopySupported
    }
  },
  computed: {
    buttonText() {
      return this.$gettext('Private link')
    },
    buttonLabel() {
      return this.$gettext('Copy private link to clipboard')
    }
  }
})
</script>

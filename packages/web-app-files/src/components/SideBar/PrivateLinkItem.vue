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
import { useStore } from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'

export default defineComponent({
  name: 'PrivateLinkItem',
  setup() {
    const { $gettext } = useGettext()
    const store = useStore<any>()
    const resource = inject<Resource>('resource')
    const privateLink = computed(() => unref(resource))

    const {
      copy,
      copied,
      isSupported: isClipboardCopySupported
    } = useClipboard({ legacy: true, copiedDuring: 550 })

    const copyLinkToClipboard = () => {
      copy(unref(privateLink).privateLink)
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

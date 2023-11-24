<template>
  <tr>
    <th scope="col" class="oc-pr-s oc-font-semibold" v-text="'WebDav path'" />
    <td class="oc-flex oc-flex-middle">
      <div
        v-oc-tooltip="resource.webDavPath"
        class="oc-text-truncate"
        v-text="resource.webDavPath"
      />
      <oc-button
        v-oc-tooltip="$gettext('Copy WebDAV path')"
        class="oc-ml-s"
        appearance="raw"
        size="small"
        :aria-label="$gettext('Copy WebDAV path to clipboard')"
        @click="copyWebDAVPathToClipboard"
      >
        <oc-icon :name="copyWebDAVPathIcon" />
      </oc-button>
    </td>
  </tr>
  <tr>
    <th scope="col" class="oc-pr-s oc-font-semibold" v-text="'WebDav url'" />
    <td class="oc-flex oc-flex-middle">
      <div v-oc-tooltip="webDavUrl" class="oc-text-truncate" v-text="webDavUrl" />
      <oc-button
        v-oc-tooltip="$gettext('Copy WebDAV url')"
        class="oc-ml-s"
        appearance="raw"
        size="small"
        :aria-label="$gettext('Copy WebDAV url to clipboard')"
        @click="copyWebDAVUrlToClipboard"
      >
        <oc-icon :name="copyWebDAVUrlIcon" />
      </oc-button>
    </td>
  </tr>
</template>

<script lang="ts">
import { defineComponent, inject, ref, Ref, computed, unref } from 'vue'
import { urlJoin } from '@ownclouders/web-client/src/utils'
import { Resource } from '@ownclouders/web-client'
import { useConfigurationManager } from '../../composables'

export default defineComponent({
  name: 'WebDavDetails',
  setup() {
    const configurationManager = useConfigurationManager()
    const resource = inject<Ref<Resource>>('resource')
    const copiedIcon = 'check'
    const copyIcon = 'file-copy'
    const copyWebDAVPathIcon = ref(copyIcon)
    const copyWebDAVUrlIcon = ref(copyIcon)

    const webDavUrl = computed(() => {
      return urlJoin(configurationManager.serverUrl, unref(resource).webDavPath)
    })

    const copyWebDAVPathToClipboard = () => {
      navigator.clipboard.writeText(unref(resource).webDavPath)
      copyWebDAVPathIcon.value = copiedIcon
      setTimeout(() => (copyWebDAVPathIcon.value = copyIcon), 500)
    }

    const copyWebDAVUrlToClipboard = () => {
      navigator.clipboard.writeText(unref(webDavUrl))
      copyWebDAVUrlIcon.value = copiedIcon
      setTimeout(() => (copyWebDAVUrlIcon.value = copyIcon), 500)
    }

    return {
      copyWebDAVPathIcon,
      copyWebDAVPathToClipboard,
      copyWebDAVUrlIcon,
      copyWebDAVUrlToClipboard,
      webDavUrl,
      resource
    }
  }
})
</script>

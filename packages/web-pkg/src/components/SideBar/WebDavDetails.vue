<template>
  <tr>
    <th scope="col" class="oc-pr-s oc-font-semibold" v-text="$gettext('WebDAV path')" />
    <td class="oc-flex oc-flex-middle">
      <div v-oc-tooltip="webDavPath" class="oc-text-truncate" v-text="webDavPath" />
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
    <th scope="col" class="oc-pr-s oc-font-semibold" v-text="$gettext('WebDAV URL')" />
    <td class="oc-flex oc-flex-middle">
      <div v-oc-tooltip="webDavUrl" class="oc-text-truncate" v-text="webDavUrl" />
      <oc-button
        v-oc-tooltip="$gettext('Copy WebDAV URL')"
        class="oc-ml-s"
        appearance="raw"
        size="small"
        :aria-label="$gettext('Copy WebDAV URL to clipboard')"
        @click="copyWebDAVUrlToClipboard"
      >
        <oc-icon :name="copyWebDAVUrlIcon" />
      </oc-button>
    </td>
  </tr>
</template>

<script lang="ts">
import { defineComponent, inject, ref, Ref, computed, unref, PropType } from 'vue'
import { Resource, SpaceResource } from '@ownclouders/web-client'
import { encodePath } from '../../utils'

export default defineComponent({
  name: 'WebDavDetails',
  props: {
    space: {
      type: Object as PropType<SpaceResource>,
      required: true
    }
  },
  setup(props) {
    const resource = inject<Ref<Resource>>('resource')
    const copiedIcon = 'check'
    const copyIcon = 'file-copy'
    const copyWebDAVPathIcon = ref(copyIcon)
    const copyWebDAVUrlIcon = ref(copyIcon)

    const webDavPath = computed(() => {
      return encodePath(unref(resource).webDavPath)
    })
    const webDavUrl = computed(() => {
      return props.space?.getWebDavUrl({ path: unref(resource).path })
    })

    const copyWebDAVPathToClipboard = () => {
      navigator.clipboard.writeText(unref(webDavPath))
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
      webDavPath,
      webDavUrl
    }
  }
})
</script>

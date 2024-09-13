<template>
  <div class="oc-flex oc-flex-middle">
    <oc-button gap-size="none" appearance="raw" @click="copyLinkToClipboard">
      <oc-icon size="small" :name="copied ? 'checkbox-circle' : 'file-copy'" />
      <span class="oc-ml-xs" v-text="$gettext('Permanent link')"
    /></oc-button>
    <oc-contextual-helper class="oc-ml-xs" :text="helperText" :title="$gettext('Permanent link')" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { Resource } from '@ownclouders/web-client'
import { useGettext } from 'vue3-gettext'
import { useClipboard } from '@vueuse/core'
import { useMessages } from '@ownclouders/web-pkg'

export default defineComponent({
  props: {
    resource: {
      type: Object as PropType<Resource>,
      required: true
    }
  },
  setup(props) {
    const { $gettext } = useGettext()
    const { showMessage } = useMessages()
    const { copy, copied } = useClipboard({ legacy: true, copiedDuring: 550 })

    const copyLinkToClipboard = () => {
      copy(props.resource.privateLink)
      showMessage({
        title: $gettext('Permanent link copied'),
        desc: $gettext('The permanent link has been copied to your clipboard.')
      })
    }

    const helperText = computed(() => {
      return $gettext(
        'Copy the link to point your team to this item. Works only for people with existing access.'
      )
    })

    return { copied, helperText, copyLinkToClipboard }
  }
})
</script>

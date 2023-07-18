<template>
  <div class="oc-error-log">
    <oc-textarea
      class="oc-mt-s oc-error-log-textarea"
      :label="contentLabel"
      :model-value="content"
      rows="4"
      readonly
    />
    <oc-button
      class="oc-width-1-1 oc-mt-xs"
      size="small"
      variation="primary"
      appearance="filled"
      v-text="copyContentButtonText"
      @click="copyContentToClipboard"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'

import { useGettext } from 'vue3-gettext'

export default defineComponent({
  name: 'OcErrorLog',
  status: 'ready',
  release: '2.0.0',

  props: {
    /**
     * Content to be displayed
     */
    content: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const { $gettext } = useGettext()
    const copyContentButtonInitialText = $gettext('Copy')
    const copyContentButtonText = ref(copyContentButtonInitialText)

    const contentLabel = computed(() => {
      return $gettext(
        'Copy the following information to pass them to technical support to troubleshoot the problem:'
      )
    })

    const copyContentToClipboard = () => {
      navigator.clipboard.writeText(props.content)
      copyContentButtonText.value = $gettext('Copied to clipboard...')
      setTimeout(() => (copyContentButtonText.value = copyContentButtonInitialText), 500)
    }

    return {
      contentLabel,
      copyContentButtonText,
      copyContentToClipboard
    }
  }
})
</script>

<style lang="scss">
.oc-error-log {
  &-textarea {
    resize: none;

    label {
      color: var(--oc-color-text-muted);
    }
  }
}
</style>

<docs>
Component to display error log.
```js
<oc-error-log>
  <oc-error-log content="X-REQUEST-ID: 123456789" />
</oc-error-log>
```
</docs>

<template>
  <AppWrapper
    v-slot="{ currentContent, ...slotArgs }: AppWrapperSlotArgs"
    application-id="text-editor"
  >
    <TextEditor v-model:current-content="currentContent.value" v-bind="slotArgs" />
  </AppWrapper>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AppWrapper, { AppWrapperSlotArgs } from 'web-pkg/src/components/AppTemplates/AppWrapper.vue'
import TextEditor from './TextEditor.vue'

export default defineComponent({
  name: 'TextEditorApp',
  components: {
    AppWrapper,
    TextEditor
  }
})
</script>

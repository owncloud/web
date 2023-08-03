<template>
  <AppWrapper
    id="text-editor"
    v-slot="{
      applicationConfig,
      resource,
      currentContent,
      serverContent,
      isDirty,
      isReadOnly
    }: SlotContent"
    application-id="text-editor"
    :url-for-resource-options="{
      disposition: 'inline'
    }"
  >
    <TextEditor
      :application-config="applicationConfig"
      :is-dirty="isDirty"
      :is-read-only="isReadOnly"
      :resource="resource"
      :current-content="currentContent"
      :server-content="serverContent"
      @update:current-content="foo"
    />
  </AppWrapper>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AppWrapper from 'web-pkg/src/components/AppTemplates/AppWrapper.vue'
import TextEditor from './TextEditor.vue'
import { Resource } from 'web-client/src/helpers/resource/types'
import { AppConfigObject } from 'web-pkg/src/apps/types'

interface SlotContent {
  applicationConfig: AppConfigObject
  resource: Resource
  currentContent: string
  serverContent: string
  isDirty: boolean
  isReadOnly: boolean
}

export default defineComponent({
  name: 'TextEditor',
  components: {
    AppWrapper,
    TextEditor
  },
  emits: ['updateCurrentContent'],
  setup() {
    const foo = (...args) => {
      console.log('Dinge', args)
    }
    return {
      foo
    }
  }
})
</script>

<template>
  <div class="oc-height-1-1" tabindex="0">
    <app-loading-spinner v-if="isLoading" />
    <iframe
      v-show="!isLoading"
      id="iframe-folder-view"
      ref="iframeRef"
      class="oc-width-1-1 oc-height-1-1"
      :title="iframeTitle"
      :src="iframeUrl.href"
      tabindex="0"
      @load="onLoad"
    ></iframe>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { Modal, useThemeStore } from '@ownclouders/web-pkg/src/composables'
import AppLoadingSpinner from '@ownclouders/web-pkg/src/components/AppLoadingSpinner.vue'
import { unref } from 'vue'

const props = defineProps<{
  modal: Modal
  publicLink: string
}>()

const iframeRef = ref<HTMLIFrameElement>()
const isLoading = ref(true)
const themeStore = useThemeStore()

const iframeTitle = themeStore.currentTheme.common?.name
const iframeUrl = new URL(props.publicLink)
iframeUrl.searchParams.append('hide-logo', 'true')
iframeUrl.searchParams.append('hide-app-switcher', 'true')
iframeUrl.searchParams.append('hide-account-menu', 'true')
iframeUrl.searchParams.append('hide-navigation', 'true')

const onLoad = () => {
  isLoading.value = false
  unref(iframeRef).contentWindow.focus()
}
</script>

<style lang="scss">
.oc-modal.folder-view-modal {
  max-width: 80vw;
  border: none;
  overflow: hidden;

  .oc-modal-title {
    display: none;
  }

  .oc-modal-body {
    padding: 0;

    &-message {
      height: 60vh;
      margin: 0;
    }
  }

  .oc-modal-body-actions {
    background-color: var(--oc-color-swatch-brand-default);
  }
}
</style>

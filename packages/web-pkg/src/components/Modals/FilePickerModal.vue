<template>
  <app-loading-spinner v-if="isLoading" />
  <iframe
    v-show="!isLoading"
    class="oc-width-1-1 oc-height-1-1"
    :src="iframeSrc"
    @load="onLoad"
  ></iframe>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import { Modal, useRouter } from '../../composables'
import { ApplicationInformation } from '../../apps'
import { RouteLocationRaw } from 'vue-router'
import AppLoadingSpinner from '../AppLoadingSpinner.vue'

export default defineComponent({
  name: 'FilePickerModal',
  components: { AppLoadingSpinner },
  props: {
    modal: { type: Object as PropType<Modal>, required: true },
    app: { type: Object as PropType<ApplicationInformation>, required: true },
    parentFolderLink: { type: Object as PropType<RouteLocationRaw>, required: true }
  },
  emits: ['confirm'],
  setup(props, { emit }) {
    const isLoading = ref(true)
    const router = useRouter()
    const parentFolderRoute = router.resolve(props.parentFolderLink)
    const availableExtensions = (props.app as ApplicationInformation).extensions.map(
      (e) => e.extension
    )
    const iframeUrl = new URL(parentFolderRoute.href, window.location.origin)
    iframeUrl.searchParams.append('embed', 'true')
    iframeUrl.searchParams.append('embed-target', 'file')
    iframeUrl.searchParams.append('embed-extensions', availableExtensions.join(','))

    const onLoad = () => {
      isLoading.value = false
    }

    console.log(iframeUrl.href)

    return {
      isLoading,
      onLoad,
      iframeSrc: iframeUrl.href
    }
  }
})
</script>

<style lang="scss">
.open-with-app-modal {
  max-width: 80vw;

  .oc-modal-body {
    padding: 0;

    &-message {
      height: 600px;
    }
  }
}
</style>

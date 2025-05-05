<template>
  <div
    v-oc-tooltip="
      isRemoteUploadInProgress ? $gettext('Please wait until all imports have finished') : null
    "
  >
    <slot :trigger-upload="triggerUpload" :upload-label-id="uploadLabelId">
      <oc-button
        :class="btnClass"
        justify-content="left"
        appearance="raw"
        :disabled="isRemoteUploadInProgress"
        @click="triggerUpload"
      >
        <resource-icon :resource="resource" size="medium" />
        <span :id="uploadLabelId">{{ buttonLabel }}</span>
      </oc-button>
    </slot>
    <input
      :id="inputId"
      ref="input"
      v-bind="inputAttrs"
      class="upload-input-target"
      type="file"
      :aria-labelledby="uploadLabelId"
      :name="isFolder ? 'file' : 'folder'"
      tabindex="-1"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onBeforeUnmount, ref } from 'vue'
import { Resource } from '@ownclouders/web-client'
import { useService, ResourceIcon } from '@ownclouders/web-pkg'
import type { UppyService } from '@ownclouders/web-pkg'

export default defineComponent({
  components: { ResourceIcon },
  props: {
    btnLabel: {
      type: String,
      required: false,
      default: ''
    },
    btnClass: {
      type: String,
      required: false,
      default: ''
    },
    isFolder: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  setup(props) {
    const uppyService = useService<UppyService>('$uppyService')
    const isRemoteUploadInProgress = ref(uppyService.isRemoteUploadInProgress())

    let uploadStartedSub: string
    let uploadCompletedSub: string

    const resource = computed(() => {
      return { extension: '', isFolder: props.isFolder } as Resource
    })

    const onUploadStarted = () =>
      (isRemoteUploadInProgress.value = uppyService.isRemoteUploadInProgress())
    const onUploadCompleted = () => (isRemoteUploadInProgress.value = false)

    onMounted(() => {
      uploadStartedSub = uppyService.subscribe('uploadStarted', onUploadStarted)
      uploadCompletedSub = uppyService.subscribe('uploadCompleted', onUploadCompleted)
    })

    onBeforeUnmount(() => {
      uppyService.unsubscribe('uploadStarted', uploadStartedSub)
      uppyService.unsubscribe('uploadCompleted', uploadCompletedSub)
    })
    return {
      isRemoteUploadInProgress,
      resource
    }
  },
  computed: {
    inputId() {
      if (this.isFolder) {
        return 'files-folder-upload-input'
      }
      return 'files-file-upload-input'
    },
    uploadLabelId() {
      if (this.isFolder) {
        return 'files-folder-upload-button'
      }
      return 'files-file-upload-button'
    },
    buttonLabel() {
      if (this.btnLabel) {
        return this.btnLabel
      }
      if (this.isFolder) {
        return this.$gettext('Folder')
      }
      return this.$gettext('Files')
    },
    inputAttrs() {
      if (this.isFolder) {
        return {
          webkitdirectory: true,
          mozdirectory: true,
          allowdirs: true
        }
      }
      return { multiple: true }
    }
  },
  mounted() {
    this.$uppyService.registerUploadInput(this.$refs.input as HTMLInputElement)
  },
  beforeUnmount() {
    this.$uppyService.removeUploadInput(this.$refs.input as HTMLInputElement)
  },
  methods: {
    triggerUpload() {
      ;(this.$refs.input as HTMLInputElement).click()
    }
  }
})
</script>

<style scoped>
.upload-input-target {
  position: absolute;
  left: -99999px;
}
</style>

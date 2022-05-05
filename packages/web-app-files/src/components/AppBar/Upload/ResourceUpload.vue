<template>
  <div>
    <oc-button :class="btnClass" justify-content="left" appearance="raw" @click="triggerUpload">
      <oc-resource-icon :resource="{ extension: '', isFolder }" size="medium" />
      <span :id="uploadLabelId">{{ buttonLabel }}</span>
    </oc-button>
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

<script>
export default {
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
    this.$uppyService.registerUploadInput(this.$refs.input)
  },
  beforeDestroy() {
    this.$uppyService.removeUploadInput(this.$refs.input)
  },
  methods: {
    triggerUpload() {
      this.$refs.input.click()
    }
  }
}
</script>

<style scoped>
.upload-input-target {
  position: absolute;
  left: -99999px;
}
</style>

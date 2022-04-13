<template>
  <div>
    <oc-button :class="btnClass" justify-content="left" appearance="raw" @click="triggerUpload">
      <oc-resource-icon :resource="{ extension: '' }" />
      <span id="files-file-upload-button">{{ btnLabel }}</span>
    </oc-button>
    <input
      id="fileUploadInput"
      ref="input"
      class="upload-input-target"
      type="file"
      aria-labelledby="files-file-upload-button"
      name="file"
      multiple
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
      default: function () {
        return this.$gettext('Files')
      }
    },
    btnClass: {
      type: String,
      required: false,
      default: ''
    }
  },
  mounted() {
    this.$uppyService.registerUploadInput(this.$refs.input)
  },
  beforeDestroy() {
    this.$uppyService.removeUploadInput(this.$refs.input.id)
  },
  methods: {
    triggerUpload() {
      this.$refs.input.click()
    }
  }
}
</script>

<style scoped="true">
#fileUploadInput {
  position: absolute;
  left: -99999px;
}
</style>

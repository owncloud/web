<template>
  <div>
    <div class="oc-text-xlarge">
      <h1 class="oc-text-normal">
        <oc-button :class="btnClass" justify-content="left" appearance="raw" @click="triggerUpload" class="oc-display-inline-block oc-text-bold oc-position-relative">
          <span :id="uploadLabelId">{{ buttonLabel }}</span>
        </oc-button>
        <span v-text="$gettext('or drag it here')" /></h1>
    </div>
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
import { defineComponent } from 'vue'
export default defineComponent({
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
  beforeUnmount() {
    this.$uppyService.removeUploadInput(this.$refs.input)
  },
  methods: {
    triggerUpload() {
      this.$refs.input.click()
    }
  }
})
</script>

<style lang="scss" scoped>
.upload-input-target {
  position: absolute;
  left: -99999px;
}

button {
  color: var(--oc-color-swatch-primary-default);
  font-weight: 600;

  &::after {
    content: '';
    position: absolute;
    width: 100%;
    transform: scaleX(0);
    height: 2px;
    bottom: -2px;
    left: 0;
    background-color: #0087ca;
    transform-origin: bottom right;
    transition: transform 0.25s ease-out;
  }

  &:hover {
    color: var(--oc-color-swatch-primary-default);
    text-decoration: none;

    &::after {
      transform: scaleX(1);
      transform-origin: bottom left;
    }
  }
}

</style>

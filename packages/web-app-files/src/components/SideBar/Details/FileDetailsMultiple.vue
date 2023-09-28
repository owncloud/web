<template>
  <div id="oc-file-details-multiple-sidebar">
    <div class="files-preview oc-mb">
      <div class="files-preview-body">
        <oc-icon class="preview-icon" size="xxlarge" variation="passive" name="file-copy" />
        <p class="preview-text" data-testid="selectedFilesText" v-text="selectedFilesString" />
      </div>
    </div>
    <div>
      <table class="details-table" :aria-label="detailsTableLabel">
        <tr data-testid="filesCount">
          <th scope="col" class="oc-pr-s oc-font-semibold" v-text="filesText" />
          <td v-text="filesCount" />
        </tr>
        <tr data-testid="foldersCount">
          <th scope="col" class="oc-pr-s oc-font-semibold" v-text="foldersText" />
          <td v-text="foldersCount" />
        </tr>
        <tr v-if="showSpaceCount" data-testid="spacesCount">
          <th scope="col" class="oc-pr-s oc-font-semibold" v-text="spacesText" />
          <td v-text="spacesCount" />
        </tr>
        <tr data-testid="size">
          <th scope="col" class="oc-pr-s oc-font-semibold" v-text="sizeText" />
          <td v-text="sizeValue" />
        </tr>
      </table>
    </div>
  </div>
</template>
<script lang="ts">
import { mapGetters } from 'vuex'
import { defineComponent } from 'vue'
import { formatFileSize } from 'web-pkg/src/helpers'

export default defineComponent({
  name: 'FileDetailsMultiple',
  props: {
    showSpaceCount: { type: Boolean, default: false }
  },
  computed: {
    ...mapGetters('Files', ['selectedFiles']),
    selectedFilesCount() {
      return this.selectedFiles.length
    },
    selectedFilesString() {
      return this.$ngettext(
        '%{ itemCount } item selected',
        '%{ itemCount } items selected',
        this.selectedFilesCount,
        {
          itemCount: this.selectedFilesCount
        }
      )
    },
    sizeValue() {
      let size = 0
      this.selectedFiles.forEach((i) => (size += parseInt(i.size)))
      return formatFileSize(size, this.$language.current)
    },
    sizeText() {
      return this.$gettext('Size')
    },
    filesCount() {
      return this.selectedFiles.filter((i) => i.type === 'file').length
    },
    filesText() {
      return this.$gettext('Files')
    },
    foldersCount() {
      return this.selectedFiles.filter((i) => i.type === 'folder').length
    },
    foldersText() {
      return this.$gettext('Folders')
    },
    spacesCount() {
      return this.selectedFiles.filter((i) => i.type === 'space').length
    },
    spacesText() {
      return this.$gettext('Spaces')
    },
    detailsTableLabel() {
      return this.$gettext('Overview of the information about the selected files')
    }
  }
})
</script>
<style lang="scss" scoped>
.files-preview {
  position: relative;
  background-color: var(--oc-color-background-muted);
  border: 10px solid var(--oc-color-background-muted);
  height: 230px;
  text-align: center;
  color: var(--oc-color-swatch-passive-muted);

  &-body {
    margin: 0;
    position: absolute;
    top: 50%;
    left: 50%;
    -ms-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);

    .preview-icon {
      display: inline-block;
    }
    .preview-text {
      display: block;
    }
  }
}
.details-table {
  text-align: left;

  tr {
    height: 1.5rem;
  }
}
</style>

<template>
  <div id="oc-file-details-multiple-sidebar">
    <div class="files-preview oc-mb">
      <div class="files-preview-body">
        <oc-icon class="preview-icon" size="xxlarge" variation="passive" name="file_copy" />
        <span class="preview-text" data-testid="selectedFilesText" v-text="selectedFilesString" />
      </div>
    </div>
    <div>
      <table class="details-table" :aria-label="detailsTableLabel">
        <tr data-testid="filesCount">
          <th scope="col" class="oc-pr-s" v-text="filesText" />
          <td v-text="filesCount" />
        </tr>
        <tr data-testid="foldersCount">
          <th scope="col" class="oc-pr-s" v-text="foldersText" />
          <td v-text="foldersCount" />
        </tr>
        <tr v-if="showSize" data-testid="size">
          <th scope="col" class="oc-pr-s" v-text="sizeText" />
          <td v-text="sizeValue" />
        </tr>
      </table>
    </div>
  </div>
</template>
<script>
import Mixins from '../../../mixins'
import MixinResources from '../../../mixins/resources'
import MixinRoutes from '../../../mixins/routes'
import { mapGetters } from 'vuex'

export default {
  mixins: [Mixins, MixinResources, MixinRoutes],
  title: $gettext => {
    return $gettext('Details')
  },
  computed: {
    ...mapGetters('Files', ['selectedFiles']),
    selectedFilesCount() {
      return this.selectedFiles.length
    },
    selectedFilesString() {
      return this.$gettextInterpolate(
        this.$ngettext(
          '%{ itemCount } item selected',
          '%{ itemCount } items selected',
          this.selectedFilesCount
        ),
        {
          itemCount: this.selectedFilesCount
        }
      )
    },
    sizeValue() {
      let size = 0
      this.selectedFiles.forEach(i => (size += parseInt(i.size)))
      return this.getResourceSize(size)
    },
    showSize() {
      return this.getResourceSize(this.selectedFiles[0].size) !== '?'
    },
    sizeText() {
      return this.$gettext('Size')
    },
    filesCount() {
      return this.selectedFiles.filter(i => i.type === 'file').length
    },
    filesText() {
      return this.$gettext('Files')
    },
    foldersCount() {
      return this.selectedFiles.filter(i => i.type === 'folder').length
    },
    foldersText() {
      return this.$gettext('Folders')
    },
    detailsTableLabel() {
      return this.$gettext('Overview of the information about the selected files')
    }
  }
}
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

  th {
    font-weight: 600;
  }
}
</style>

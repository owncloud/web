<template>
  <div id="oc-file-details-multiple-sidebar">
    <div class="files-preview oc-mb">
      <div class="files-preview-body">
        <oc-icon class="preview-icon" size="xxlarge" variation="passive" name="file-copy" />
        <p class="preview-text" data-testid="selectedFilesText" v-text="selectedFilesString" />
      </div>
    </div>
    <div>
      <table class="details-table" :aria-label="detailsTableLabel" role="presentation">
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
        <tr v-if="hasSize" data-testid="size">
          <th scope="col" class="oc-pr-s oc-font-semibold" v-text="sizeText" />
          <td v-text="sizeValue" />
        </tr>
      </table>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, unref } from 'vue'
import { storeToRefs } from 'pinia'
import { formatFileSize, useResourcesStore } from '@ownclouders/web-pkg'

export default defineComponent({
  name: 'FileDetailsMultiple',
  props: {
    showSpaceCount: { type: Boolean, default: false }
  },
  setup() {
    const resourcesStore = useResourcesStore()
    const { selectedResources } = storeToRefs(resourcesStore)

    const hasSize = computed(() => {
      return unref(selectedResources).some((resource) => Object.hasOwn(resource, 'size'))
    })

    return { hasSize, selectedResources }
  },
  computed: {
    selectedFilesCount() {
      return this.selectedResources.length
    },
    selectedFilesString() {
      return this.$ngettext(
        '%{ itemCount } item selected',
        '%{ itemCount } items selected',
        this.selectedFilesCount,
        {
          itemCount: this.selectedFilesCount.toString()
        }
      )
    },
    sizeValue() {
      let size = 0
      this.selectedResources.forEach((i) => (size += parseInt(i.size?.toString() || '0')))
      return formatFileSize(size, this.$language.current)
    },
    sizeText() {
      return this.$gettext('Size')
    },
    filesCount() {
      return this.selectedResources.filter((i) => i.type === 'file').length
    },
    filesText() {
      return this.$gettext('Files')
    },
    foldersCount() {
      return this.selectedResources.filter((i) => i.type === 'folder').length
    },
    foldersText() {
      return this.$gettext('Folders')
    },
    spacesCount() {
      return this.selectedResources.filter((i) => i.type === 'space').length
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

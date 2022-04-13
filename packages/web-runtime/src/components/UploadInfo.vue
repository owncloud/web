<template>
  <div
    id="upload-info"
    class="oc-p-m oc-rounded oc-box-shadow-medium"
    :class="{ 'oc-hidden': !showInfo }"
  >
    <div class="upload-info-title oc-flex oc-flex-between oc-flex-middle oc-mb-m">
      <span class="oc-flex oc-flex-middle">
        <oc-icon
          v-if="!filesUploading && !uploadCancelled"
          variation="success"
          name="check"
          class="oc-mr-s"
        />
        <oc-icon v-else-if="uploadCancelled" variation="danger" name="close" class="oc-mr-s" />
        <span v-text="uploadInfoTitle" />
      </span>

      <oc-button appearance="raw" @click="closeInfo">
        <oc-icon name="close" />
      </oc-button>
    </div>
    <div class="upload-info-status-bar" />
    <div class="upload-info-successful-uploads">
      <ul id="files-collaborators-list" class="oc-list">
        <li
          v-for="(item, idx) in successfulUploads"
          :key="idx"
          :class="{ 'oc-mb-s': idx !== successfulUploads.length - 1 }"
        >
          <oc-resource
            v-if="displayFileAsResource(item)"
            :key="item.path"
            :resource="item"
            :is-path-displayed="true"
            :is-thumbnail-displayed="true"
            :is-resource-clickable="false"
            :parent-folder-name-default="defaultParentFolderName(item)"
            :folder-link="folderLink(item)"
            :parent-folder-link="parentFolderLink(item)"
          />
          <span v-else class="oc-flex oc-flex-middle">
            <oc-resource-icon :resource="item" size="large" class="file_info__icon oc-mr-s" />
            <oc-resource-name
              :name="item.name"
              :extension="item.extension"
              :type="item.type"
              full-path=""
              :is-path-displayed="false"
            />
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import '@uppy/core/dist/style.css'
import '@uppy/status-bar/dist/style.css'
import path from 'path'
import { useCapabilitySpacesEnabled } from 'web-pkg/src/composables'

export default {
  setup() {
    return {
      hasSpaces: useCapabilitySpacesEnabled()
    }
  },
  data: () => ({
    showInfo: false,
    filesUploading: 0,
    uploadCancelled: false,
    successfulUploads: []
  }),
  computed: {
    uploadInfoTitle() {
      if (this.filesUploading) {
        return this.$gettextInterpolate(
          this.$ngettext(
            '%{ filesUploading } file uploading...',
            '%{ filesUploading } files uploading...',
            this.filesUploading
          ),
          { filesUploading: this.filesUploading }
        )
      }
      if (this.uploadCancelled) {
        return this.$gettext('Upload cancelled')
      }
      return this.$gettext('Upload completed')
    }
  },
  mounted() {
    this.$uppyService.useStatusBar({
      targetSelector: '.upload-info-status-bar',
      getText: this.$gettext
    })
  },
  created() {
    this.$uppyService.$on('uploadStarted', () => {
      this.showInfo = true
      this.filesUploading = this.filesUploading + 1
      this.uploadCancelled = false
    })
    this.$uppyService.$on('uploadCompleted', () => {
      this.filesUploading = this.filesUploading - 1
    })
    this.$uppyService.$on('uploadCancelled', () => {
      this.filesUploading = 0
      this.uploadCancelled = true
    })
    this.$uppyService.$on('fileUploadedSuccessfully', (file, route) => {
      this.successfulUploads.push({ ...file, targetRoute: route })
    })
  },
  methods: {
    closeInfo() {
      this.showInfo = false
      this.filesUploading = 0
      this.successfulUploads = []
      this.uploadCancelled = false
    },
    displayFileAsResource(file) {
      return !!file.targetRoute
    },
    folderLink(file) {
      return this.createFolderLink(file.path, file.storageId, file.targetRoute)
    },
    parentFolderLink(file) {
      return this.createFolderLink(path.dirname(file.path), file.storageId, file.targetRoute)
    },
    defaultParentFolderName(file) {
      // FIXME: use isLocationSpacesActive(), but it currently lies in the files app
      if (file.targetRoute?.name === 'files-spaces-project') {
        return file.targetRoute.params.name
      }
      return this.hasSpaces ? this.$gettext('Personal') : this.$gettext('All files and folders')
    },
    createFolderLink(path, storageId, targetRoute) {
      if (!targetRoute) {
        return {}
      }

      const strippedPath = path.replace(/^\//, '')
      const route = {
        name: targetRoute.name,
        query: targetRoute.query,
        params: {
          ...(storageId && path && { storageId })
        }
      }

      if (strippedPath) {
        route.params = { ...targetRoute.params }
        route.params.item = strippedPath
      }

      return route
    }
  }
}
</script>

<style lang="scss" scoped>
#upload-info {
  position: absolute;
  right: 20px;
  background: #fff;
  bottom: 20px;
  width: 300px;
}
</style>

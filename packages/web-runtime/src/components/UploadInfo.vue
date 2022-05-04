<template>
  <div id="upload-info" class="oc-rounded oc-box-shadow-medium" :class="{ 'oc-hidden': !showInfo }">
    <div class="upload-info-title oc-flex oc-flex-between oc-flex-middle oc-px-m oc-pt-m">
      <span class="oc-flex oc-flex-middle" v-text="uploadInfoTitle" />
      <oc-button
        id="close-upload-info-btn"
        v-oc-tooltip="$gettext('Close')"
        appearance="raw"
        @click="closeInfo"
      >
        <oc-icon name="close" />
      </oc-button>
    </div>
    <div class="upload-info-status-bar oc-px-m" />
    <div
      class="upload-info-successful-uploads oc-px-m oc-pb-m"
      :class="{ 'oc-pt-m': successfulUploads.length }"
    >
      <ul class="oc-list">
        <li
          v-for="(item, idx) in successfulUploads"
          :key="idx"
          class="oc-flex oc-flex-middle"
          :class="{ 'oc-mb-s': idx !== successfulUploads.length - 1 }"
        >
          <oc-icon name="check" variation="success" size="small" />
          <oc-resource
            v-if="displayFileAsResource(item)"
            :key="item.path"
            :resource="item"
            :is-path-displayed="true"
            :is-thumbnail-displayed="displayThumbnails"
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
import { useCapabilityShareJailEnabled } from 'web-pkg/src/composables'
import { mapGetters } from 'vuex'

export default {
  setup() {
    return {
      hasShareJail: useCapabilityShareJailEnabled()
    }
  },
  data: () => ({
    showInfo: false,
    filesUploading: 0,
    uploadCancelled: false,
    successfulUploads: []
  }),
  computed: {
    ...mapGetters(['configuration']),

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

      return this.$gettextInterpolate(
        this.$ngettext(
          '%{ successfulUploads } upload completed',
          '%{ successfulUploads } uploads completed',
          this.successfulUploads.length
        ),
        { successfulUploads: this.successfulUploads.length }
      )
    },
    displayThumbnails() {
      return !this.configuration.options.disablePreviews
    }
  },
  mounted() {
    this.$uppyService.useStatusBar({
      targetSelector: '.upload-info-status-bar',
      getText: this.$gettext
    })
  },
  created() {
    this.$uppyService.subscribe('uploadStarted', () => {
      this.showInfo = true
      this.filesUploading = this.filesUploading + 1
      this.uploadCancelled = false
    })
    this.$uppyService.subscribe('uploadCompleted', () => {
      this.filesUploading = this.filesUploading - 1
    })
    this.$uppyService.subscribe('uploadCancelled', () => {
      this.filesUploading = 0
      this.uploadCancelled = true
      if (!this.successfulUploads.length) {
        this.closeInfo()
      }
    })
    this.$uppyService.subscribe('uploadedFileFetched', ({ uppyResource, fetchedFile }) => {
      this.successfulUploads.push({
        ...fetchedFile,
        targetRoute: uppyResource.meta.route
      })
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
      return this.hasShareJail ? this.$gettext('Personal') : this.$gettext('All files and folders')
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
          ...(storageId && path && { storageId }),
          ...(targetRoute.params?.storage && { storage: targetRoute.params?.storage })
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

<style lang="scss">
#upload-info {
  position: absolute;
  right: 20px;
  background-color: var(--oc-color-background-secondary);
  bottom: 20px;
  width: 300px;

  .oc-resource-details {
    padding-left: var(--oc-space-xsmall);
  }

  .oc-resource-indicators .parent-folder .text {
    color: var(--oc-color-text-default);
  }

  .upload-info-successful-uploads {
    max-height: 50vh;
    overflow-y: auto;
  }

  .upload-info-status-bar {
    .uppy-StatusBar {
      height: unset;
      background-color: unset !important;
    }
    .uppy-StatusBar-actionBtn--retry:hover {
      background-color: unset !important;
      text-decoration: underline;
    }
    .uppy-StatusBar-content {
      padding-left: var(--oc-space-xsmall) !important;
      color: var(--oc-color-text-default);
      margin-top: 0.75rem;
    }
    .uppy-StatusBar-actions {
      right: var(--oc-space-xsmall) !important;
    }
    .uppy-c-btn {
      color: var(--oc-color-text-default);
    }
    .uppy-StatusBar-statusPrimary {
      font-size: var(--oc-font-size-default);
    }
    .uppy-StatusBar-statusSecondary {
      color: var(--oc-color-swatch-passive-default);
    }
    .uppy-StatusBar-statusIndicator {
      margin-right: var(--oc-space-medium) !important;
    }
    .uppy-StatusBar-actionBtn--retry {
      background-color: unset;
      font-size: var(--oc-font-size-small);
      padding: 0;
    }
    .uppy-StatusBar.is-error,
    .uppy-StatusBar.is-uploading {
      margin-top: var(--oc-space-medium);
    }
    .uppy-StatusBar.is-error .uppy-StatusBar-progress {
      background-color: var(--oc-color-swatch-danger-default);
    }
    .uppy-StatusBar.is-error .uppy-StatusBar-statusIndicator {
      color: var(--oc-color-swatch-danger-default);
      width: var(--oc-space-small);
      height: var(--oc-space-small);
    }
    .uppy-StatusBar-details,
    .uppy-StatusBar-actionBtn--retry svg {
      display: none;
    }
  }
}
</style>

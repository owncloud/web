<template>
  <div v-if="showInfo" id="upload-info" class="oc-rounded oc-box-shadow-medium">
    <div
      class="
        upload-info-title
        oc-flex oc-flex-between oc-flex-middle oc-px-m oc-py-s oc-rounded-top
      "
    >
      <span class="oc-flex oc-flex-middle oc-my-xs" v-text="uploadInfoTitle" />
      <oc-button
        v-if="!filesInProgressCount"
        id="close-upload-info-btn"
        v-oc-tooltip="$gettext('Close')"
        appearance="raw"
        @click="closeInfo"
      >
        <oc-icon variation="inverse" name="close" />
      </oc-button>
    </div>
    <div class="upload-info-status oc-p-m oc-flex oc-flex-between oc-flex-middle">
      <oc-progress
        v-if="runningUploads"
        :value="totalProgress"
        :max="100"
        size="small"
        class="upload-info-progress"
      />
      <div
        v-else
        :class="{
          'upload-info-danger': errors.length && !uploadsCancelled,
          'upload-info-success': !errors.length && !uploadsCancelled
        }"
      >
        {{ uploadingLabel }}
      </div>
      <div class="oc-flex">
        <oc-button
          appearance="raw"
          class="oc-text-muted oc-text-small"
          @click="toggleInfo"
          v-text="infoExpanded ? $gettext('Hide details') : $gettext('Show details')"
        ></oc-button>
        <oc-button
          v-if="!runningUploads && errors.length"
          v-oc-tooltip="$gettext('Retry all failed uploads')"
          class="oc-ml-s"
          appearance="raw"
          :aria-label="$gettext('Retry all failed uploads')"
          @click="retryUploads"
        >
          <oc-icon name="restart" fill-type="line" />
        </oc-button>
        <oc-button
          v-if="runningUploads"
          id="pause-upload-info-btn"
          v-oc-tooltip="uploadsPaused ? $gettext('Resume uploads') : $gettext('Pause uploads')"
          class="oc-ml-s"
          appearance="raw"
          @click="togglePauseUploads"
        >
          <oc-icon :name="uploadsPaused ? 'play' : 'pause'" fill-type="line" />
        </oc-button>
        <oc-button
          v-if="runningUploads"
          id="cancel-upload-info-btn"
          v-oc-tooltip="$gettext('Cancel')"
          class="oc-ml-s"
          appearance="raw"
          @click="cancelAllUploads"
        >
          <oc-icon name="close" fill-type="line" />
        </oc-button>
      </div>
    </div>
    <div v-if="infoExpanded" class="upload-info-items oc-px-m oc-pb-m">
      <ul class="oc-list">
        <li
          v-for="(item, idx) in uploads"
          :key="idx"
          class="oc-flex oc-flex-middle"
          :class="{
            'oc-mb-s': idx !== Object.keys(uploads).length - 1
          }"
        >
          <oc-icon v-if="item.status === 'error'" name="close" variation="danger" size="small" />
          <oc-icon
            v-else-if="item.status === 'success'"
            name="check"
            variation="success"
            size="small"
          />
          <oc-icon v-else-if="item.status === 'cancelled'" name="close" size="small" />
          <oc-icon v-else-if="uploadsPaused" name="pause" size="small" />
          <oc-spinner v-else size="small" />

          <oc-resource
            v-if="displayFileAsResource(item)"
            :key="item.path"
            class="oc-ml-s"
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

const UPLOAD_STATUSES = Object.freeze({
  success: 1,
  error: 2
})

export default {
  setup() {
    return {
      hasShareJail: useCapabilityShareJailEnabled()
    }
  },
  data: () => ({
    showInfo: false, // show the overlay?
    infoExpanded: false, // show the info including all uploads?
    uploads: {}, // uploads that are being displayed via "infoExpanded"
    errors: [], // all failed files
    successful: [], // all successful files
    filesInProgressCount: 0, // files (not folders!) that are being processed currently
    totalProgress: 0, // current uploads progress (0-100)
    uploadsPaused: false, // all uploads paused?
    uploadsCancelled: false, // all uploads cancelled?
    runningUploads: 0 // all uploads (not files!) that are in progress currently
  }),
  computed: {
    ...mapGetters(['configuration']),

    uploadInfoTitle() {
      if (this.filesInProgressCount) {
        return this.$gettextInterpolate(
          this.$ngettext(
            '%{ filesInProgressCount } item uploading...',
            '%{ filesInProgressCount } items uploading...',
            this.filesInProgressCount
          ),
          { filesInProgressCount: this.filesInProgressCount }
        )
      }
      if (this.uploadsCancelled) {
        return this.$gettext('Upload cancelled')
      }
      if (this.errors.length) {
        return this.$gettext('Upload failed')
      }
      return this.$gettext('Upload complete')
    },
    uploadingLabel() {
      if (this.errors.length) {
        const count = this.successful.length + this.errors.length
        return this.$gettextInterpolate(
          this.$ngettext(
            '%{ errors } of %{ uploads } item failed',
            '%{ errors } of %{ uploads } items failed',
            count
          ),
          { uploads: count, errors: this.errors.length }
        )
      }
      return this.$gettextInterpolate(
        this.$ngettext(
          '%{ successfulUploads } item uploaded',
          '%{ successfulUploads } items uploaded',
          this.successful.length
        ),
        { successfulUploads: this.successful.length }
      )
    },
    displayThumbnails() {
      return !this.configuration?.options?.disablePreviews
    }
  },
  created() {
    this.$uppyService.subscribe('uploadStarted', () => {
      // No upload in progress -> clean overlay
      if (!this.runningUploads && this.showInfo) {
        this.cleanOverlay()
      }

      this.showInfo = true
      this.runningUploads += 1
    })
    this.$uppyService.subscribe('addedForUpload', (files) => {
      this.filesInProgressCount += files.filter((f) => !f.isFolder).length

      for (const file of files) {
        const { relativeFolder, uploadId, topLevelFolderId } = file.meta
        const isTopLevelItem = !relativeFolder
        // only add top level items to this.uploads because we only show those
        if (isTopLevelItem) {
          this.uploads[uploadId] = file
          // top level folders get initialized with file counts about their files inside
          if (file.isFolder && this.uploads[uploadId].filesCount === undefined) {
            this.uploads[uploadId].filesCount = 0
            this.uploads[uploadId].errorCount = 0
            this.uploads[uploadId].successCount = 0
          }
        }

        // count all files inside top level folders to mark them as successful or failed later
        if (!file.isFolder && !isTopLevelItem) {
          this.uploads[topLevelFolderId].filesCount += 1
        }
      }
    })
    this.$uppyService.subscribe('uploadCompleted', () => {
      this.runningUploads -= 1
    })
    this.$uppyService.subscribe('progress', (value) => {
      this.totalProgress = value
    })
    this.$uppyService.subscribe('uploadError', (file) => {
      if (this.errors.includes(file.meta.uploadId)) {
        return
      }

      // file inside folder -> was not added to this.uploads, but must be now because of error
      if (!this.uploads[file.meta.uploadId]) {
        this.uploads[file.meta.uploadId] = file
      }

      if (file.meta.relativePath) {
        this.uploads[file.meta.uploadId].path = file.meta.relativePath
      } else {
        this.uploads[file.meta.uploadId].path = `${file.meta.currentFolder}${file.name}`
      }

      this.uploads[file.meta.uploadId].targetRoute = file.meta.route
      this.uploads[file.meta.uploadId].status = 'error'
      this.errors.push(file.meta.uploadId)
      this.filesInProgressCount -= 1

      if (file.meta.topLevelFolderId) {
        this.handleTopLevelFolderUpdate(file, 'error')
      }
    })
    this.$uppyService.subscribe('fileSuccessfullyUploaded', (file) => {
      // item inside folder
      if (!this.uploads[file.meta.uploadId]) {
        if (!file.isFolder) {
          this.successful.push(file.meta.uploadId)
          this.filesInProgressCount -= 1

          if (file.meta.topLevelFolderId) {
            this.handleTopLevelFolderUpdate(file, 'success')
          }
        }

        return
      }

      // file inside folder that succeeded via retry can now be removed again from this.uploads
      if (file.meta.relativeFolder) {
        if (!file.isFolder) {
          this.successful.push(file.meta.uploadId)
          this.filesInProgressCount -= 1
          if (file.meta.topLevelFolderId) {
            this.handleTopLevelFolderUpdate(file, 'success')
          }
        }

        delete this.uploads[file.meta.uploadId]
        return
      }

      this.uploads[file.meta.uploadId] = file
      this.uploads[file.meta.uploadId].path = `${file.meta.currentFolder}${file.name}`
      this.uploads[file.meta.uploadId].targetRoute = file.meta.route

      if (!file.isFolder) {
        this.uploads[file.meta.uploadId].status = 'success'
        this.successful.push(file.meta.uploadId)
        this.filesInProgressCount -= 1
      }
    })
  },
  methods: {
    handleTopLevelFolderUpdate(file, status) {
      const topLevelFolder = this.uploads[file.meta.topLevelFolderId]
      if (status === 'success') {
        topLevelFolder.successCount += 1
      } else {
        topLevelFolder.errorCount += 1
      }

      // all files for this top level folder are finished
      if (topLevelFolder.successCount + topLevelFolder.errorCount === topLevelFolder.filesCount) {
        topLevelFolder.status = topLevelFolder.errorCount ? 'error' : 'success'
      }
    },
    closeInfo() {
      this.showInfo = false
      this.infoExpanded = false
      this.cleanOverlay()
    },
    cleanOverlay() {
      this.uploadsCancelled = false
      this.uploads = {}
      this.errors = []
      this.successful = []
      this.filesInProgressCount = 0
      this.runningUploads = 0
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
      const { targetRoute } = file
      // FIXME: use isLocationSpacesActive(), but it currently lies in the files app
      if (targetRoute?.name === 'files-spaces-project') {
        return targetRoute.params.name
      }
      // Root of a share -> use share name
      if (this.hasShareJail && targetRoute?.name === 'files-spaces-share') {
        return targetRoute.params.shareName
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
          ...(targetRoute.params?.storage && { storage: targetRoute.params?.storage }),
          ...(targetRoute.params?.shareName && { shareName: targetRoute.params?.shareName })
        }
      }

      if (strippedPath) {
        route.params = { ...targetRoute.params }
        route.params.item = strippedPath
      }

      return route
    },
    toggleInfo() {
      this.infoExpanded = !this.infoExpanded
    },
    retryUploads() {
      this.filesInProgressCount += this.errors.length
      this.runningUploads += 1
      for (const fileID of this.errors) {
        this.uploads[fileID].status = undefined

        const topLevelFolderId = this.uploads[fileID].meta.topLevelFolderId
        if (topLevelFolderId) {
          this.uploads[topLevelFolderId].status = undefined
          this.uploads[topLevelFolderId].errorCount = 0
        }
      }
      this.errors = []
      this.$uppyService.retryAllUploads()
    },
    togglePauseUploads() {
      if (this.uploadsPaused) {
        this.$uppyService.resumeAllUploads()
      } else {
        this.$uppyService.pauseAllUploads()
      }

      this.uploadsPaused = !this.uploadsPaused
    },
    cancelAllUploads() {
      this.uploadsCancelled = true
      this.filesInProgressCount = 0
      this.$uppyService.cancelAllUploads()
      const runningUploads = Object.values(this.uploads).filter(
        (u) => u.status !== 'success' && u.status !== 'error'
      )

      for (const item of runningUploads) {
        this.uploads[item.meta.uploadId].status = 'cancelled'
      }
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
  width: 400px;

  .oc-resource-details {
    padding-left: var(--oc-space-xsmall);
  }

  .upload-info-title {
    background-color: var(--oc-color-swatch-brand-default);
    color: var(--oc-color-swatch-inverse-default);
  }

  .oc-resource-indicators .parent-folder .text {
    color: var(--oc-color-text-default);
  }

  .upload-info-items {
    max-height: 50vh;
    overflow-y: auto;
  }

  .upload-info-progress {
    width: 50%;
  }
  .upload-info-danger {
    color: var(--oc-color-swatch-danger-default);
  }
  .upload-info-success {
    color: var(--oc-color-swatch-success-default);
  }
}
</style>

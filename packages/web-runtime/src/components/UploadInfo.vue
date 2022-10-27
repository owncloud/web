<template>
  <div v-if="showInfo" id="upload-info" class="oc-rounded oc-box-shadow-medium">
    <div
      class="upload-info-title oc-flex oc-flex-between oc-flex-middle oc-px-m oc-py-s oc-rounded-top"
    >
      <p v-oc-tooltip="uploadDetails" class="oc-my-xs" v-text="uploadInfoTitle" />
      <oc-button
        v-if="!filesInProgressCount"
        id="close-upload-info-btn"
        v-oc-tooltip="$gettext('Close')"
        appearance="raw"
        variation="inverse"
        @click="closeInfo"
      >
        <oc-icon name="close" />
      </oc-button>
    </div>
    <div
      class="upload-info-status oc-px-m oc-pt-m oc-flex oc-flex-between oc-flex-middle"
      :class="{
        'oc-pb-m': !runningUploads
      }"
    >
      <div v-if="runningUploads" class="oc-flex oc-flex-middle">
        <oc-spinner size="small" class="oc-mr-s" />
        <span class="oc-text-small oc-text-muted" v-text="remainingTime" />
      </div>
      <div
        v-else
        class="upload-info-label"
        :class="{
          'upload-info-danger': Object.keys(errors).length && !uploadsCancelled,
          'upload-info-success': !Object.keys(errors).length && !uploadsCancelled
        }"
      >
        {{ uploadingLabel }}
      </div>
      <div class="oc-flex">
        <oc-button
          appearance="raw"
          class="oc-text-muted oc-text-small upload-info-toggle-details-btn"
          @click="toggleInfo"
          v-text="infoExpanded ? $gettext('Hide details') : $gettext('Show details')"
        ></oc-button>
        <oc-button
          v-if="!runningUploads && Object.keys(errors).length"
          v-oc-tooltip="$gettext('Retry all failed uploads')"
          class="oc-ml-s"
          appearance="raw"
          :aria-label="$gettext('Retry all failed uploads')"
          @click="retryUploads"
        >
          <oc-icon name="restart" fill-type="line" />
        </oc-button>
        <oc-button
          v-if="runningUploads && uploadsPausable && !inPreparation && !inFinalization"
          id="pause-upload-info-btn"
          v-oc-tooltip="uploadsPaused ? $gettext('Resume upload') : $gettext('Pause upload')"
          class="oc-ml-s"
          appearance="raw"
          @click="togglePauseUploads"
        >
          <oc-icon :name="uploadsPaused ? 'play-circle' : 'pause-circle'" fill-type="line" />
        </oc-button>
        <oc-button
          v-if="runningUploads && !inPreparation && !inFinalization"
          id="cancel-upload-info-btn"
          v-oc-tooltip="$gettext('Cancel upload')"
          class="oc-ml-s"
          appearance="raw"
          @click="cancelAllUploads"
        >
          <oc-icon name="close-circle" fill-type="line" />
        </oc-button>
      </div>
    </div>
    <div v-if="runningUploads" class="upload-info-progress oc-mx-m oc-pb-m oc-mt-s">
      <oc-progress
        :value="totalProgress"
        :max="100"
        size="small"
        :indeterminate="!filesInProgressCount"
      />
    </div>
    <div v-if="infoExpanded" class="upload-info-items oc-px-m oc-pb-m">
      <ul class="oc-list">
        <li
          v-for="(item, idx) in uploads"
          :key="idx"
          :class="{
            'oc-mb-s': idx !== Object.keys(uploads).length - 1
          }"
        >
          <span class="oc-flex oc-flex-middle">
            <oc-icon v-if="item.status === 'error'" name="close" variation="danger" size="small" />
            <oc-icon
              v-else-if="item.status === 'success'"
              name="check"
              variation="success"
              size="small"
            />
            <oc-icon v-else-if="item.status === 'cancelled'" name="close" size="small" />
            <oc-icon v-else-if="uploadsPaused" name="pause" size="small" />
            <div v-else class="oc-flex"><oc-spinner size="small" /></div>
            <oc-resource
              v-if="displayFileAsResource(item)"
              :key="item.path"
              class="oc-ml-s"
              :resource="item"
              :is-path-displayed="true"
              :is-thumbnail-displayed="displayThumbnails"
              :is-resource-clickable="isResourceClickable(item)"
              :parent-folder-name-default="defaultParentFolderName(item)"
              :folder-link="folderLink(item)"
              :parent-folder-link="parentFolderLink(item)"
            />
            <span v-else class="oc-flex oc-flex-middle oc-text-truncate">
              <oc-resource-icon :resource="item" size="large" class="file_info__icon oc-mx-s" />
              <oc-resource-name
                :name="item.name"
                :extension="item.extension"
                :type="item.type"
                full-path=""
                :is-path-displayed="false"
              />
            </span>
          </span>
          <span
            v-if="getUploadItemMessage(item)"
            class="upload-info-message oc-ml-xs oc-text-small"
            :class="getUploadItemClass(item)"
            v-text="getUploadItemMessage(item)"
          ></span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapGetters } from 'vuex'
import { isUndefined } from 'lodash-es'
import getSpeed from '@uppy/utils/lib/getSpeed'

import { urlJoin } from 'web-client/src/utils'
import { configurationManager } from 'web-pkg/src/configuration'
import { useCapabilityShareJailEnabled } from 'web-pkg/src/composables'
import { formatFileSize } from 'web-pkg/src/helpers'
import { UppyResource } from '../composables/upload'

export default defineComponent({
  setup() {
    return {
      hasShareJail: useCapabilityShareJailEnabled()
    }
  },
  data: () => ({
    showInfo: false, // show the overlay?
    infoExpanded: false, // show the info including all uploads?
    uploads: {} as Record<any, any>, // uploads that are being displayed via "infoExpanded"
    errors: {}, // all failed files
    successful: [], // all successful files
    filesInProgressCount: 0, // files (not folders!) that are being processed currently
    totalProgress: 0, // current uploads progress (0-100)
    uploadsPaused: false, // all uploads paused?
    uploadsCancelled: false, // all uploads cancelled?
    inFinalization: false, // uploads transferred but still need to be finalized
    inPreparation: true, // preparation before upload
    runningUploads: 0, // all uploads (not files!) that are in progress currently
    bytesTotal: 0,
    bytesUploaded: 0,
    uploadSpeed: 0,
    filesInEstimation: {},
    timeStarted: null,
    remainingTime: undefined
  }),
  computed: {
    ...mapGetters(['configuration']),

    uploadDetails() {
      if (!this.uploadSpeed || !this.runningUploads) {
        return ''
      }
      const uploadedBytes = formatFileSize(this.bytesUploaded, this.$language.current)
      const totalBytes = formatFileSize(this.bytesTotal, this.$language.current)
      const currentUploadSpeed = formatFileSize(this.uploadSpeed, this.$language.current)

      return this.$gettext('%{uploadedBytes} of %{totalBytes} (%{currentUploadSpeed}/s)', {
        uploadedBytes,
        totalBytes,
        currentUploadSpeed
      })
    },
    uploadInfoTitle() {
      if (this.inFinalization) {
        return this.$gettext('Finalizing upload...')
      }

      if (this.filesInProgressCount && !this.inPreparation) {
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
      if (Object.keys(this.errors).length) {
        return this.$gettext('Upload failed')
      }
      if (!this.runningUploads) {
        return this.$gettext('Upload complete')
      }
      return this.$gettext('Preparing upload...')
    },
    uploadingLabel() {
      if (Object.keys(this.errors).length) {
        const count = this.successful.length + Object.keys(this.errors).length
        return this.$gettextInterpolate(
          this.$ngettext(
            '%{ errors } of %{ uploads } item failed',
            '%{ errors } of %{ uploads } items failed',
            count
          ),
          { uploads: count, errors: Object.keys(this.errors).length }
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
    },
    uploadsPausable() {
      return this.$uppyService.tusActive()
    }
  },
  created() {
    this.$uppyService.subscribe('uploadStarted', () => {
      if (!this.remainingTime) {
        this.remainingTime = this.$gettext('Calculating estimated time...')
      }

      // No upload in progress -> clean overlay
      if (!this.runningUploads && this.showInfo) {
        this.cleanOverlay()
      }

      this.showInfo = true
      this.runningUploads += 1
      this.inFinalization = false
    })
    this.$uppyService.subscribe('addedForUpload', (files) => {
      this.filesInProgressCount += files.filter((f) => !f.isFolder).length

      for (const file of files) {
        if (file.data?.size) {
          this.bytesTotal += file.data.size
        }

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
        if (!file.isFolder && !isTopLevelItem && this.uploads[topLevelFolderId]) {
          this.uploads[topLevelFolderId].filesCount += 1
        }
      }
    })
    this.$uppyService.subscribe('uploadCompleted', () => {
      this.runningUploads -= 1

      if (!this.runningUploads) {
        this.resetProgress()
      }
    })
    this.$uppyService.subscribe('progress', (value) => {
      this.totalProgress = value
    })
    this.$uppyService.subscribe('upload-progress', ({ file, progress }) => {
      if (!this.timeStarted) {
        this.timeStarted = new Date()
        this.inPreparation = false
      }

      if (this.filesInEstimation[file.meta.uploadId] === undefined) {
        this.filesInEstimation[file.meta.uploadId] = 0
      }

      const byteIncrease = progress.bytesUploaded - this.filesInEstimation[file.meta.uploadId]
      this.bytesUploaded += byteIncrease
      this.filesInEstimation[file.meta.uploadId] = progress.bytesUploaded

      const timeElapsed = +new Date() - this.timeStarted

      this.uploadSpeed = getSpeed({
        bytesUploaded: this.bytesUploaded,
        uploadStarted: this.timeStarted
      })

      const progressPercent = (100 * this.bytesUploaded) / this.bytesTotal
      if (progressPercent === 0) {
        return
      }
      const totalTimeNeededInMilliseconds = (timeElapsed / progressPercent) * 100
      const remainingMilliseconds = totalTimeNeededInMilliseconds - timeElapsed

      this.remainingTime = this.getRemainingTime(remainingMilliseconds)
      if (progressPercent === 100) {
        this.inFinalization = true
      }
    })
    this.$uppyService.subscribe('uploadError', ({ file, error }) => {
      if (this.errors[file.meta.uploadId]) {
        return
      }

      // file inside folder -> was not added to this.uploads, but must be now because of error
      if (!this.uploads[file.meta.uploadId]) {
        this.uploads[file.meta.uploadId] = file
      }

      if (file.meta.relativePath) {
        this.uploads[file.meta.uploadId].path = file.meta.relativePath
      } else {
        this.uploads[file.meta.uploadId].path = urlJoin(file.meta.currentFolder, file.name)
      }

      this.uploads[file.meta.uploadId].targetRoute = file.meta.route
      this.uploads[file.meta.uploadId].status = 'error'
      this.errors[file.meta.uploadId] = error
      this.filesInProgressCount -= 1

      if (file.meta.topLevelFolderId) {
        this.handleTopLevelFolderUpdate(file, 'error')
      }
    })
    this.$uppyService.subscribe('uploadSuccess', (file) => {
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
      this.uploads[file.meta.uploadId].path = urlJoin(file.meta.currentFolder, file.name)
      this.uploads[file.meta.uploadId].targetRoute = this.buildRouteFromUppyResource(file)

      if (!file.isFolder) {
        this.uploads[file.meta.uploadId].status = 'success'
        this.successful.push(file.meta.uploadId)
        this.filesInProgressCount -= 1
      }
    })
  },
  methods: {
    getRemainingTime(remainingMilliseconds) {
      const roundedRemainingMinutes = Math.round(remainingMilliseconds / 1000 / 60)
      if (roundedRemainingMinutes >= 1 && roundedRemainingMinutes < 60) {
        return this.$gettextInterpolate(
          this.$ngettext(
            '%{ roundedRemainingMinutes } minute left',
            '%{ roundedRemainingMinutes } minutes left',
            roundedRemainingMinutes
          ),
          { roundedRemainingMinutes }
        )
      }

      const roundedRemainingHours = Math.round(remainingMilliseconds / 1000 / 60 / 60)
      if (roundedRemainingHours > 0) {
        return this.$gettextInterpolate(
          this.$ngettext(
            '%{ roundedRemainingHours } hour left',
            '%{ roundedRemainingHours } hours left',
            roundedRemainingHours
          ),
          { roundedRemainingHours }
        )
      }

      return this.$gettext('Few seconds left')
    },
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
      this.resetProgress()
    },
    cleanOverlay() {
      this.uploadsCancelled = false
      this.uploads = {}
      this.errors = {}
      this.successful = []
      this.filesInProgressCount = 0
      this.runningUploads = 0
    },
    resetProgress() {
      this.bytesTotal = 0
      this.bytesUploaded = 0
      this.filesInEstimation = {}
      this.timeStarted = null
      this.remainingTime = undefined
      this.inPreparation = true
      this.inFinalization = false
    },
    displayFileAsResource(file) {
      return !!file.targetRoute
    },
    isResourceClickable(file) {
      return file.isFolder === true
    },
    folderLink(file) {
      if (!file.isFolder) {
        return {}
      }
      return {
        ...file.targetRoute,
        params: {
          ...file.targetRoute.params,
          driveAliasAndItem: urlJoin(file.targetRoute.params.driveAliasAndItem, file.name, {
            leadingSlash: false
          })
        },
        query: {
          ...file.targetRoute.query,
          ...(configurationManager.options.routing.idBased &&
            !isUndefined(file.meta.fileId) && { fileId: file.meta.fileId })
        }
      }
    },
    parentFolderLink(file: any) {
      return {
        ...file.targetRoute,
        query: {
          ...file.targetRoute.query,
          ...(configurationManager.options.routing.idBased &&
            !isUndefined(file.meta.currentFolderId) && { fileId: file.meta.currentFolderId })
        }
      }
    },
    buildRouteFromUppyResource(resource) {
      if (!resource.meta.routeName) {
        return null
      }
      return {
        name: resource.meta.routeName,
        params: {
          driveAliasAndItem: resource.meta.routeDriveAliasAndItem
        },
        query: {
          ...(resource.meta.routeShareId && { shareId: resource.meta.routeShareId })
        }
      }
    },
    defaultParentFolderName(file) {
      const {
        meta: { spaceName, driveType }
      } = file

      if (!this.hasShareJail) {
        return this.$gettext('All files and folders')
      }

      if (driveType === 'personal') {
        return this.$gettext('Personal')
      }

      if (driveType === 'public') {
        return this.$gettext('Public link')
      }

      return spaceName
    },
    toggleInfo() {
      this.infoExpanded = !this.infoExpanded
    },
    retryUploads() {
      this.filesInProgressCount += Object.keys(this.errors).length
      this.runningUploads += 1
      for (const fileID of Object.keys(this.errors)) {
        this.uploads[fileID].status = undefined

        const topLevelFolderId = this.uploads[fileID].meta.topLevelFolderId
        if (topLevelFolderId) {
          this.uploads[topLevelFolderId].status = undefined
          this.uploads[topLevelFolderId].errorCount = 0
        }
      }
      this.errors = {}
      this.$uppyService.retryAllUploads()
    },
    togglePauseUploads() {
      if (this.uploadsPaused) {
        this.$uppyService.resumeAllUploads()
        this.timeStarted = null
      } else {
        this.$uppyService.pauseAllUploads()
      }

      this.uploadsPaused = !this.uploadsPaused
    },
    cancelAllUploads() {
      this.uploadsCancelled = true
      this.filesInProgressCount = 0
      this.runningUploads = 0
      this.resetProgress()
      this.$uppyService.cancelAllUploads()
      const runningUploads = Object.values(this.uploads).filter(
        (u: any) => u.status !== 'success' && u.status !== 'error'
      )

      for (const item of runningUploads as UppyResource[]) {
        this.uploads[item.meta.uploadId].status = 'cancelled'
      }
    },
    getUploadItemMessage(item) {
      const error = this.errors[item.meta.uploadId]

      if (error) {
        // TODO: Remove code as soon as https://github.com/tus/tus-js-client/issues/448 is solved
        let errorMessage = error.message || this.$gettext('Unknown error')
        if (error.message.includes('response code: 507')) {
          errorMessage = this.$gettext('Quota exceeded')
        }
        if (error.message.includes('precondition failed:')) {
          errorMessage = this.$gettext('Parent folder does not exist')
        }

        return errorMessage

        /**
         * TODO: Enable code as soon as https://github.com/tus/tus-js-client/issues/448 is solved
        switch (error?.originalResponse?.getStatus()) {
          case 507:
            return this.$gettext('Quota exceeded')
          default:
            return error.message || this.$gettext('Unknown error')
        }**/
      }
    },
    getUploadItemClass(item) {
      return this.errors[item.meta.uploadId] ? 'upload-info-danger' : 'upload-info-success'
    }
  }
})
</script>

<style lang="scss">
#upload-info {
  background-color: var(--oc-color-background-secondary);
  width: 400px;

  @media (max-width: 640px) {
    margin: 0 auto;
    width: 100%;
    max-width: 500px;
  }

  .oc-resource-details {
    padding-left: var(--oc-space-xsmall);
  }

  .upload-info-title {
    background-color: var(--oc-color-swatch-brand-default);
  }

  .upload-info-title p {
    color: var(--oc-color-swatch-inverse-default);
  }

  .oc-resource-indicators .parent-folder .text {
    color: var(--oc-color-text-default);
  }

  .upload-info-items {
    max-height: 50vh;
    overflow-y: auto;
  }

  .upload-info-danger {
    color: var(--oc-color-swatch-danger-default);
  }
  .upload-info-success {
    color: var(--oc-color-swatch-success-default);
  }
}
</style>

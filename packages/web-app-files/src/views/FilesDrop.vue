<template>
  <div id="files-drop-container" class="oc-height-1-1 oc-flex oc-flex-column oc-flex-between">
    <h1 class="oc-invisible-sr">{{ pageTitle }}</h1>
    <div class="oc-p oc-height-1-1">
      <div v-if="loading" key="loading-drop" class="oc-flex oc-flex-column oc-flex-middle">
        <h2 class="oc-login-card-title">
          <translate>Loading public link…</translate>
        </h2>
        <oc-spinner :aria-hidden="true" />
      </div>
      <div v-else key="loaded-drop" class="oc-flex oc-flex-column oc-flex-middle oc-height-1-1">
        <div class="oc-text-center oc-width-1-1 oc-width-xxlarge@m">
          <h2 v-text="title" />
          <!-- needs uppy dropzone -->
          <div id="files-drop-zone" class="uk-flex uk-flex-middle uk-flex-center uk-placeholder">
            <oc-icon name="file_upload" />
            <translate>Drop files here to upload or click to select file</translate>
          </div>
          <div id="previews" hidden />
        </div>
        <div
          class="oc-flex oc-flex-center oc-overflow-auto oc-width-1-1 oc-mt"
          :class="{ 'files-empty': !getUploadedFiles }"
        >
          <oc-table-simple v-if="getUploadedFiles" class="oc-width-1-1 oc-width-xxlarge@m">
            <oc-tbody>
              <oc-tr v-for="(file, key) in getUploadedFiles" :key="key">
                <oc-td class="oc-pl-rm" v-text="file.name" />
                <oc-td width="shrink" class="oc-text-nowrap oc-text-muted">
                  <oc-resource-size :size="file.size" />
                </oc-td>
                <oc-td width="shrink" class="oc-pr-rm">
                  <oc-icon
                    v-if="file.status === 'done'"
                    name="checkbox-circle"
                    size="small"
                    variation="success"
                  />
                  <oc-icon
                    v-if="file.status === 'error'"
                    name="information"
                    size="small"
                    variation="danger"
                  />
                  <oc-spinner
                    v-if="file.status === 'uploading' || file.status === 'init'"
                    size="small"
                    :aria-label="$_ocUploadingFileMessage(file.name)"
                  />
                </oc-td>
              </oc-tr>
            </oc-tbody>
          </oc-table-simple>
        </div>
        <div v-if="errorMessage" class="oc-text-center">
          <h2>
            <translate>An error occurred while loading the public link</translate>
          </h2>
          <p class="oc-m-rm" v-text="errorMessage" />
        </div>
      </div>
    </div>
    <div class="oc-text-center">
      <p v-text="configuration.currentTheme.general.slogan" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { DavProperties, DavProperty } from 'web-pkg/src/constants'
import { linkRoleUploaderFolder } from '../helpers/share'
import { createLocationOperations, createLocationPublic } from '../router'

import Uppy from '@uppy/core'
import Tus from '@uppy/tus'
import XHRUpload from '@uppy/xhr-upload'
import StatusBar from '@uppy/status-bar'
import DropTarget from '@uppy/drop-target'

export default {
  data() {
    return {
      loading: true,
      errorMessage: null,
      uploadedFiles: [],
      uploadedFilesChangeTracker: 0
    }
  },
  computed: {
    ...mapGetters(['capabilities', 'configuration', 'newFileHandlers', 'user']),
    ...mapGetters('Files', ['currentFolder', 'publicLinkPassword']),
    pageTitle() {
      return this.$gettext(this.$route.meta.title)
    },
    publicLinkToken() {
      return this.$route.params.token
    },
    title() {
      // share might not be loaded
      if (this.share) {
        const translated = this.$gettext('%{owner} shared this folder with you for uploading')
        return this.$gettextInterpolate(
          translated,
          { owner: this.share.getProperty(this.$client.publicFiles.PUBLIC_LINK_SHARE_OWNER) },
          true
        )
      }
      return ''
    },
    url() {
      return this.$client.publicFiles.getFileUrl(this.publicLinkToken) + '/'
    },
    getUploadedFiles() {
      return this.uploadedFilesChangeTracker && this.uploadedFiles.values()
    }
  },
  mounted() {
    this.resolvePublicLink()

    const client = this.$client
    const uppyHeaders = client.helpers.buildHeaders()

    // might make sense to initialize an Uppy instance in the runtime?
    // TODO: set debug to false
    const uppy = new Uppy({ debug: true, autoProceed: true })

    // TODO: Build headers differently in public context?
    // if (this.publicPage()) { ... maybe use this.headers to obtain token ... }

    // TODO: What about flaky capability loading and its implications?
    // if (this.capabilities?.files.tus_support?.max_chunk_size > 0) {
    //   const chunkSize =
    //     this.capabilities.files.tus_support.max_chunk_size > 0 &&
    //     this.configuration.uploadChunkSize !== Infinity
    //       ? Math.max(
    //           this.capabilities.files.tus_support.max_chunk_size,
    //           this.configuration.uploadChunkSize
    //         )
    //       : this.configuration.uploadChunkSize

    delete uppyHeaders['OCS-APIREQUEST']

    uppy.use(Tus, {
      endpoint: this.url,
      headers: uppyHeaders,
      chunkSize: this.configuration.uploadChunkSize,
      removeFingerprintOnSuccess: true,
      overridePatchMethod: '',
      retryDelays: [0, 3000, 5000, 10000, 20000]
    })
    // } else {
    // uppy.use(XHRUpload, {
    //   endpoint: this.url,
    //   method: 'put',
    //   headers: uppyHeaders
    // })
    // }

    // // upload via drag&drop handling
    uppy.use(DropTarget, {
      target: '#files-drop-zone'
    })

    // upload button handling (files & folders separately)
    // doesn't recognize elements yet since they're tippy children, maybe use $refs?
    const uploadInputTarget = document.getElementById('#files-drop-zone')

    uploadInputTarget.addEventListener('change', (event) => {
      const files = Array.from(event.target.files)

      files.forEach((file) => {
        try {
          console.log('beginning upload for file:', file)
          uppy.addFile({
            source: 'file input',
            name: file.name,
            type: file.type,
            data: file
          })
        } catch (err) {
          console.error('error upload file:', file)
          if (err.isRestriction) {
            // handle restrictions
            console.log('Restriction error:', err)
          } else {
            // handle other errors
            console.error(err)
          }
        }
      })
    })

    // uppy.use(StatusBar, {
    //   id: 'StatusBar',
    //   target: '#files-app-bar',
    //   hideAfterFinish: true,
    //   showProgressDetails: true,
    //   hideUploadButton: false,
    //   hideRetryButton: false,
    //   hidePauseResumeButton: false,
    //   hideCancelButton: false,
    //   doneButtonHandler: null,
    //   locale: {
    //     // TODO: Uppy l10n research
    //   }
    // })

    uppy.on('upload-error', (file, error, response) => {
      console.log('error with file:', file.id)
      console.log('error message:', error)
      this.onFileError(error.toString())
    })

    uppy.on('file-removed', () => {
      uploadInputTarget.forEach((item) => {
        item.value = null
      })
    })

    uppy.on('complete', (result) => {
      result.successful.forEach((file) => {
        this.uploadedFiles.push(file)
      })
      uploadInputTarget.forEach((item) => {
        item.value = null
      })

      console.log('successful files:', result.successful)
      console.log('failed files:', result.failed)
    })
  },
  methods: {
    resolvePublicLink() {
      this.loading = true

      this.$client.publicFiles
        .list(this.publicLinkToken, this.publicLinkPassword, DavProperties.PublicLink, '0')
        .then((files) => {
          // Redirect to files list if the link doesn't have role "uploader"
          const sharePermissions = parseInt(files[0].getProperty(DavProperty.PublicLinkPermission))
          if (linkRoleUploaderFolder.bitmask(false) !== sharePermissions) {
            this.$router.replace(
              createLocationPublic('files-public-files', {
                params: { item: this.publicLinkToken }
              })
            )
            return
          }
          this.share = files[0]
        })
        .catch((error) => {
          // likely missing password, redirect to public link password prompt
          if (error.statusCode === 401) {
            this.$router.push(
              createLocationOperations('files-operations-resolver-public-link', {
                params: {
                  token: this.publicLinkToken
                }
              })
            )
            return
          }
          this.errorMessage = error
        })
        .finally(() => {
          this.loading = false
        })
    },
    dropZoneFileAdded(event) {
      const uploadId = event.upload.uuid
      this.uploadedFilesChangeTracker++
      this.uploadedFiles.set(uploadId, { name: event.name, size: event.size, status: 'init' })

      this.uploadQueue
        .add(() =>
          this.$client.publicFiles.putFileContents(
            this.publicLinkToken,
            event.name,
            this.publicLinkPassword,
            event,
            {
              // automatically rename in case of duplicates
              headers: { 'OC-Autorename': 1 },
              onProgress: (progressEvent) => {
                this.uploadedFilesChangeTracker++
                this.uploadedFiles.set(uploadId, {
                  name: event.name,
                  size: event.size,
                  status: 'uploading'
                })
              }
            }
          )
        )
        .then((e) => {
          this.uploadedFilesChangeTracker++
          this.uploadedFiles.set(uploadId, { name: event.name, size: event.size, status: 'done' })
        })
        .catch((e) => {
          console.error('Error uploading file ', event.name, ': ', e)
          this.uploadedFilesChangeTracker++
          this.uploadedFiles.set(uploadId, { name: event.name, size: event.size, status: 'error' })
        })
    },

    $_ocUploadingFileMessage(fileName) {
      const translated = this.$gettext('Uploading file "%{fileName}"')
      return this.$gettextInterpolate(translated, { fileName }, true)
    }
  }
}
</script>

<style lang="scss">
#files-drop-container {
  .oc-files-drop-drag-area {
    background: transparent;
    border: 1px dashed var(--oc-color-input-border);
    padding: var(--oc-space-xlarge);
  }
}
</style>

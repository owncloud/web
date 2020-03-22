<template>
  <div id="files-drop-container" class="uk-height-1-1 uk-flex uk-flex-column uk-flex-between">
    <div class="uk-padding uk-height-1-1">
      <div v-if="loading" key="loading-drop" class="uk-flex uk-flex-column uk-flex-middle">
        <h3 :aria-hidden="true">{{ $_loadingPublicLinkTitle }}</h3>
        <oc-spinner size="medium" :aria-label="$_loadingPublicLinkTitle" />
      </div>
      <div v-else key="loaded-drop" class="uk-flex uk-flex-column uk-flex-middle uk-height-1-1">
        <div class="uk-text-center uk-width-1-1 uk-width-xxlarge@m">
          <h3 v-text="title" />
          <vue-dropzone
            id="oc-dropzone"
            :options="dropzoneOptions"
            :use-custom-slot="true"
            :include-styling="false"
            @vdropzone-file-added="dropZoneFileAdded"
          >
            <div class="uk-flex uk-flex-middle uk-flex-center uk-placeholder">
              <oc-icon name="file_upload" />
              <translate>Drop files here to upload or click to select file</translate>
            </div>
          </vue-dropzone>
          <div id="previews" hidden />
        </div>
        <div v-if="getUploadedFiles" class="uk-flex uk-flex-center uk-overflow-auto uk-width-1-1">
          <oc-table class="uk-width-1-1 uk-width-xxlarge@m">
            <oc-table-group>
              <oc-table-row v-for="(file, key) in getUploadedFiles" :key="key">
                <oc-table-cell class="uk-padding-remove-left" v-text="file.name" />
                <oc-table-cell shrink class="uk-text-nowrap uk-text-meta">{{
                  file.size | fileSize
                }}</oc-table-cell>
                <oc-table-cell shrink class="uk-padding-remove-right uk-preserve-width">
                  <oc-icon
                    v-if="file.status === 'done'"
                    name="ready"
                    size="xsmall"
                    variation="success"
                  />
                  <oc-icon
                    v-if="file.status === 'error'"
                    name="info"
                    size="xsmall"
                    variation="danger"
                  />
                  <oc-spinner
                    v-if="file.status === 'uploading' || file.status === 'init'"
                    size="xsmall"
                    :aria-label="$_ocUploadingFileMessage(file.name)"
                  />
                </oc-table-cell>
              </oc-table-row>
            </oc-table-group>
          </oc-table>
        </div>
        <div v-if="errorMessage" class="uk-text-center">
          <translate tag="h3">An error occurred while loading the public link</translate>
          <p class="uk-margin-remove" v-text="errorMessage" />
        </div>
      </div>
    </div>
    <div class="uk-text-center">
      <p v-text="configuration.theme.general.slogan" />
    </div>
  </div>
</template>

<script>
import vue2DropZone from 'vue2-dropzone'
import { mapGetters } from 'vuex'
import Mixins from '../../mixins.js'

export default {
  components: {
    vueDropzone: vue2DropZone
  },
  mixins: [Mixins],
  data() {
    return {
      loading: true,
      errorMessage: null,
      uploadedFiles: new Map(),
      uploadedFilesChangeTracker: 0
    }
  },
  computed: {
    ...mapGetters(['configuration']),
    ...mapGetters('Files', ['davProperties', 'publicLinkPassword']),
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
    },
    dropzoneOptions() {
      return {
        url: this.url,
        clickable: true,
        createImageThumbnails: false,
        autoQueue: false,
        previewsContainer: '#previews'
      }
    },
    $_loadingPublicLinkTitle() {
      return this.$gettext('Loading public link…')
    }
  },
  mounted() {
    this.resolvePublicLink()
  },
  methods: {
    resolvePublicLink() {
      this.loading = true
      const properties = this.davProperties.concat([
        this.$client.publicFiles.PUBLIC_LINK_ITEM_TYPE,
        this.$client.publicFiles.PUBLIC_LINK_PERMISSION,
        this.$client.publicFiles.PUBLIC_LINK_EXPIRATION,
        this.$client.publicFiles.PUBLIC_LINK_SHARE_DATETIME,
        this.$client.publicFiles.PUBLIC_LINK_SHARE_OWNER
      ])
      this.$client.publicFiles
        .list(this.publicLinkToken, this.publicLinkPassword, properties, '0')
        .then(files => {
          if (files[0].getProperty(this.$client.publicFiles.PUBLIC_LINK_SHARE_DATETIME !== '4')) {
            this.$router.push({
              name: 'public-files',
              params: {
                item: this.publicLinkToken
              }
            })
            return
          }
          this.share = files[0]
        })
        .catch(error => {
          // likely missing password, redirect to public link password prompt
          if (error.statusCode === 401) {
            this.$router.push({
              name: 'public-link',
              params: {
                token: this.publicLinkToken
              }
            })
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
              onProgress: progressEvent => {
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
        .then(e => {
          this.uploadedFilesChangeTracker++
          this.uploadedFiles.set(uploadId, { name: event.name, size: event.size, status: 'done' })
        })
        .catch(e => {
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

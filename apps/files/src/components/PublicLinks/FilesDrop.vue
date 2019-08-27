<template>
  <div id="files-drop-container" class="uk-height-1-1 uk-flex uk-flex-column uk-flex-between">
    <div class="uk-padding uk-height-1-1">
      <div class="uk-flex uk-flex-column uk-flex-middle" v-if="loading" key="loading-drop">
        <translate tag="h3">Loading public link…</translate>
        <oc-spinner size="medium" />
      </div>
      <div class="uk-flex uk-flex-column uk-flex-middle uk-height-1-1" v-else key="loaded-drop">
        <div class="uk-text-center uk-width-1-1 uk-width-xxlarge@m">
          <h3 v-text="title" />
          <vue-dropzone
            id="oc-dropzone"
            :options="dropzoneOptions"
            @vdropzone-file-added="dropZoneFileAdded"
            :useCustomSlot=true
            :includeStyling=false
          >
            <div class="uk-flex uk-flex-middle uk-flex-center uk-placeholder">
              <oc-icon name="file_upload" />
              <translate>Drop files here to upload or click to select file</translate>
            </div>
          </vue-dropzone>
          <div id="previews" hidden />
        </div>
        <div class="uk-flex uk-flex-center uk-overflow-auto uk-width-1-1" v-if="getUploadedFiles">
          <oc-table class="uk-width-1-1 uk-width-xxlarge@m">
            <oc-table-group>
              <oc-table-row v-for="(file, key) in getUploadedFiles" :key="key">
                <oc-table-cell class="uk-padding-remove-left" v-text="file.name" />
                <oc-table-cell shrink class="uk-text-nowrap uk-text-meta">{{ file.size | fileSize }}</oc-table-cell>
                <oc-table-cell shrink class="uk-padding-remove-right uk-preserve-width">
                  <oc-icon name="ready" variation="success" v-if="file.status === 'done'" />
                  <oc-icon name="info" variation="danger" v-if="file.status === 'error'" />
                  <oc-spinner v-if="file.status === 'uploading' || file.status === 'init'" />
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
import FileUpload from '../../FileUpload.js'
import { mapGetters } from 'vuex'
import Mixins from '../../mixins.js'

export default {
  components: {
    vueDropzone: vue2DropZone
  },
  mixins: [
    Mixins
  ],
  data () {
    return {
      loading: true,
      errorMessage: null,
      uploadedFiles: new Map(),
      uploadedFilesChangeTracker: 0
    }
  },
  mounted () {
    this.resolvePublicLink()
  },
  computed: {
    ...mapGetters(['configuration']),
    ...mapGetters('Files', ['davProperties']),
    title () {
      const translated = this.$gettext('%{owner} shared this folder with you for uploading')
      return this.$gettextInterpolate(translated, { owner: this.share.getProperty(this.$client.publicFiles.PUBLIC_LINK_SHARE_OWNER) })
    },
    url () {
      return this.$client.publicFiles.getFileUrl(this.$route.params.token) + '/'
    },
    getUploadedFiles () {
      return this.uploadedFilesChangeTracker && this.uploadedFiles.values()
    },
    dropzoneOptions () {
      return {
        url: this.url,
        clickable: true,
        createImageThumbnails: false,
        autoQueue: false,
        previewsContainer: '#previews'
      }
    }
  },
  methods: {
    ...mapGetters('Files', ['publicLinkPassword']),
    resolvePublicLink () {
      this.loading = true
      const properties = this.davProperties.concat([
        this.$client.publicFiles.PUBLIC_LINK_ITEM_TYPE,
        this.$client.publicFiles.PUBLIC_LINK_PERMISSION,
        this.$client.publicFiles.PUBLIC_LINK_EXPIRATION,
        this.$client.publicFiles.PUBLIC_LINK_SHARE_DATETIME,
        this.$client.publicFiles.PUBLIC_LINK_SHARE_OWNER
      ]
      )
      this.$client.publicFiles.list(this.$route.params.token, this.password, properties, '0').then(files => {
        if (files[0].getProperty(this.$client.publicFiles.PUBLIC_LINK_SHARE_DATETIME !== '4')) {
          this.$router.push({
            name: 'public-files',
            params: {
              item: this.$route.params.token
            }
          })
          return
        }
        this.share = files[0]
      }).catch(error => {
        this.errorMessage = error
      }).finally(() => {
        this.loading = false
      })
    },
    dropZoneFileAdded (event) {
      const uploadId = event.upload.uuid
      const headers = {}
      const password = this.publicLinkPassword
      if (password) {
        headers.Authorization = 'Basic ' + Buffer.from('public:' + password).toString('base64')
      }
      this.uploadedFilesChangeTracker++
      this.uploadedFiles.set(uploadId, { name: event.name, size: event.size, status: 'init' })
      const fileUpload = new FileUpload(event, event.name, this.url, headers, (progressEvent, file) => {
        this.uploadedFilesChangeTracker++
        this.uploadedFiles.set(uploadId, { name: event.name, size: event.size, status: 'uploading' })
      }, 'PUT')
      fileUpload
        .upload()
        .then(e => {
          this.uploadedFilesChangeTracker++
          this.uploadedFiles.set(uploadId, { name: event.name, size: event.size, status: 'done' })
        })
        .catch(e => {
          this.uploadedFilesChangeTracker++
          this.uploadedFiles.set(uploadId, { name: event.name, size: event.size, status: 'error' })
        })
    }
  }
}
</script>

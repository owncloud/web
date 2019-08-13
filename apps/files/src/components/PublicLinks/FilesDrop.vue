<template>
    <div id="files">
      <div id="files-drop-container">
          <div v-if="loading">
            <h3 class="uk-flex uk-flex-middle uk-flex-center"><translate>Loading public link…</translate></h3>
            <oc-spinner class="uk-flex uk-flex-middle uk-flex-center"></oc-spinner>
          </div>
        <div v-if="!loading">
          <h3 class="uk-flex uk-flex-middle uk-flex-center">{{title}}</h3>
          <vue-dropzone
            id="oc-dropzone"
            :options="dropzoneOptions"
            @vdropzone-file-added="dropZoneFileAdded"
            :useCustomSlot=true
            :includeStyling=false
          >
            <div class="uk-flex uk-flex-middle uk-flex-center uk-placeholder">
              <oc-icon name="file_upload"></oc-icon>
              <translate>You can drag files here for upload</translate>
            </div>
          </vue-dropzone>
          <div id="previews" hidden></div>
          <h4 class="uk-flex uk-flex-middle uk-flex-center"><translate>Uploaded files</translate></h4>
          <oc-table>
            <oc-table-group>
              <oc-table-row v-for="(file, key) in getUploadedFiles" :key="key">
                <oc-table-cell>{{file.name}}</oc-table-cell>
                <oc-table-cell>{{file.size | fileSize}}</oc-table-cell>
                <oc-table-cell>
                  <oc-icon name="ready" variation="success" v-if="file.status === 'done'"></oc-icon>
                  <oc-icon name="info" variation="danger" v-if="file.status === 'error'"></oc-icon>
                  <oc-spinner v-if="file.status === 'uploading' || file.status === 'init'"></oc-spinner>
                </oc-table-cell>
              </oc-table-row>
            </oc-table-group>
          </oc-table>
        </div>
          <div v-if="errorMessage">
            <h3 class="uk-flex uk-flex-middle uk-flex-center"><translate>An error occurred while loading the public link</translate></h3>
            <span class="uk-flex uk-flex-middle uk-flex-center">{{ errorMessage }}</span>
          </div>
          <div class="uk-flex uk-flex-middle uk-flex-center">
            <p>
              {{ configuration.theme.general.slogan }}
            </p>
          </div>
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
      const translated = this.$gettext('%{owner} shared this folder with you for uploading.')
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
        headers['Authorization'] = 'Basic ' + Buffer.from('public:' + password).toString('base64')
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

<template>
  <div id="files-drop-container" class="uk-height-1-1 uk-flex uk-flex-column uk-flex-between">
    <h1 class="oc-invisible-sr">{{ pageTitle }}</h1>
    <div class="oc-p uk-height-1-1">
      <div v-if="loading" key="loading-drop" class="uk-flex uk-flex-column uk-flex-middle">
        <h2 class="oc-login-card-title">
          <translate>Loading public link…</translate>
        </h2>
        <oc-spinner :aria-hidden="true" />
      </div>
      <div v-else key="loaded-drop" class="uk-flex uk-flex-column uk-flex-middle uk-height-1-1">
        <div class="uk-text-center uk-width-1-1 uk-width-xxlarge@m">
          <h2 v-text="title" />
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
        <div
          class="uk-flex uk-flex-center uk-overflow-auto uk-width-1-1"
          :class="{ 'files-empty': !getUploadedFiles }"
        >
          <oc-table-simple v-if="getUploadedFiles" class="uk-width-1-1 uk-width-xxlarge@m">
            <oc-tbody>
              <oc-tr v-for="(file, key) in getUploadedFiles" :key="key">
                <oc-td class="oc-pl-rm" v-text="file.name" />
                <oc-td width="shrink" class="uk-text-nowrap oc-text-muted">
                  {{ getResourceSize(file.size) }}
                </oc-td>
                <oc-td width="shrink" class="oc-pr-rm uk-preserve-width">
                  <oc-icon
                    v-if="file.status === 'done'"
                    name="ready"
                    size="small"
                    variation="success"
                  />
                  <oc-icon
                    v-if="file.status === 'error'"
                    name="info"
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
        <div v-if="errorMessage" class="uk-text-center">
          <h2>
            <translate>An error occurred while loading the public link</translate>
          </h2>
          <p class="oc-m-rm" v-text="errorMessage" />
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
import Mixins from '../mixins.js'
import MixinResources from '../mixins/resources'

export default {
  components: {
    vueDropzone: vue2DropZone
  },
  mixins: [Mixins, MixinResources],
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
    },
    dropzoneOptions() {
      return {
        url: this.url,
        clickable: true,
        createImageThumbnails: false,
        autoQueue: false,
        previewsContainer: '#previews'
      }
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
              name: 'files-public-list',
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
              name: 'files-public-link',
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

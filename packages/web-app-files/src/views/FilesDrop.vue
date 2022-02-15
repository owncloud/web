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
          <vue-dropzone
            id="oc-dropzone"
            :options="dropzoneOptions"
            :use-custom-slot="true"
            :include-styling="false"
            @vdropzone-file-added="dropZoneFileAdded"
          >
            <div class="oc-flex oc-flex-middle oc-flex-center oc-files-drop-drag-area">
              <oc-icon name="file-upload" />
              <translate>Drop files here to upload or click to select file</translate>
            </div>
          </vue-dropzone>
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
import vue2DropZone from 'vue2-dropzone'
import { mapGetters } from 'vuex'
import Mixins from '../mixins.js'
import { DavProperties, DavProperty } from 'web-pkg/src/constants'
import { linkRoleUploaderFolder } from '../helpers/share'
import { createLocationOperations, createLocationPublic } from '../router'

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
    ...mapGetters('Files', ['publicLinkPassword']),
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

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
          <file-upload
            id="files-drop-zone"
            ref="fileUpload"
            class="uk-flex uk-flex-middle uk-flex-center uk-placeholder"
            :btn-label="$gettext('Drop files here to upload or click to select file')"
          />
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
import { mapActions, mapGetters } from 'vuex'
import { DavProperties, DavProperty } from 'web-pkg/src/constants'
import { linkRoleUploaderFolder } from '../helpers/share'
import { createLocationOperations, createLocationPublic } from '../router'

import { uppyService } from 'web-pkg/src/services'
import FileUpload from '../components/AppBar/Upload/FileUpload.vue'
import CustomTus from 'web-pkg/src/uppy/customTus'
import DropTarget from '@uppy/drop-target'

export default {
  components: {
    FileUpload
  },
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
  watch: {
    loading: {
      handler: async function (value) {
        if (!value) {
          await this.$nextTick()

          const uppy = uppyService.getUppyInstance({
            uploadPath: this.url,
            capabilities: this.capabilities,
            configuration: this.configuration,
            headers: this.$client.helpers.buildHeaders(),
            $gettext: this.$gettext,
            customTus: CustomTus
          })

          this.$refs.fileUpload.$refs.input.addEventListener('change', (event) => {
            const files = Array.from(event.target.files)

            files.forEach((file) => {
              try {
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

          uppy.use(DropTarget, {
            target: '#files-drop-container'
          })

          uppy.on('file-added', (file) => {
            if (uppy.getPlugin('XHRUpload')) {
              const filePath = file.name
              uppy.setFileState(file.id, {
                xhrUpload: {
                  endpoint: `${this.url.replace(/\/+$/, '')}/${filePath.replace(/^\/+/, '')}`
                }
              })
            }
          })

          uppy.on('upload-error', (file, error, response) => {
            console.error(error)
            this.showMessage({
              title: this.$gettext('Failed to upload'),
              status: 'danger'
            })
          })

          uppy.on('upload', ({ id, fileIDs }) => {
            if (fileIDs.length) {
              this.$root.$emit('fileUploadStarted')
            }
          })

          uppy.on('cancel-all', () => {
            this.$root.$emit('fileUploadsCancelled')
          })

          uppy.on('complete', (result) => {
            this.$root.$emit('fileUploadCompleted')

            result.successful.forEach((file) => {
              this.$root.$emit('fileUploadedSuccessfully', file)
              this.uploadedFiles.push(file)
              uppy.removeFile(file.id)
            })
          })
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.resolvePublicLink()
  },
  methods: {
    ...mapActions(['showMessage']),

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

    $_ocUploadingFileMessage(fileName) {
      const translated = this.$gettext('Uploading file "%{fileName}"')
      return this.$gettextInterpolate(translated, { fileName }, true)
    },

    triggerUpload() {
      this.$refs.fileInput.click()
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
#fileUploadInput {
  position: absolute;
  left: -99999px;
}
</style>

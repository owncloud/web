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

import FileUpload from '../components/AppBar/Upload/FileUpload.vue'
import {
  getCurrentInstance,
  onMounted,
  onUnmounted
} from '@vue/composition-api/dist/vue-composition-api'
import { useUpload } from 'web-runtime/src/composables/upload'

export default {
  components: {
    FileUpload
  },
  setup() {
    const instance = getCurrentInstance().proxy
    const uppyService = instance.$uppyService

    onMounted(() => {
      uppyService.$on('filesSelected', instance.onFilesSelected)
      uppyService.$on('uploadError', instance.onFileError)

      uppyService.useDropTarget({
        targetSelector: '#files-drop-container',
        uppyService
      })
    })

    onUnmounted(() => {
      uppyService.$off('filesSelected', instance.onFilesSelected)
      uppyService.$off('uploadError', instance.onFileError)
    })

    return {
      ...useUpload({
        uppyService
      })
    }
  },
  data() {
    return {
      loading: true,
      errorMessage: null
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

    onFilesSelected(files) {
      const uppyResources = files.map((file) => ({
        source: 'FileDrop',
        name: file.name,
        type: file.type,
        data: file,
        meta: {
          tusEndpoint: this.url,
          relativePath: file.webkitRelativePath || file.relativePath || ''
        }
      }))

      this.$uppyService.uploadFiles(uppyResources)
    },

    onFileError(error) {
      console.error(error)
      this.showMessage({
        title: this.$gettext('Failed to upload'),
        status: 'danger'
      })
    }
  }
}
</script>

<style lang="scss">
#files-drop-container {
  background: transparent;
  border: 1px dashed var(--oc-color-input-border);
  margin: var(--oc-space-xlarge);
}
</style>

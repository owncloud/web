<template>
  <div id="files-drop-container" class="oc-height-1-1 oc-flex oc-flex-column oc-flex-between">
    <div v-if="dragareaEnabled" class="dragarea" />
    <h1 class="oc-invisible-sr">{{ pageTitle }}</h1>
    <div class="oc-p oc-height-1-1">
      <div v-if="loading" key="loading-drop" class="oc-flex oc-flex-column oc-flex-middle">
        <h2 class="oc-login-card-title">
          <span v-text="$gettext('Loading public link…')" />
        </h2>
        <oc-spinner :aria-hidden="true" />
      </div>
      <div v-else key="loaded-drop" class="oc-flex oc-flex-column oc-flex-middle oc-height-1-1">
        <div class="oc-text-center oc-width-1-1 oc-width-xxlarge@m">
          <h2 v-text="title" />
          <resource-upload
            id="files-drop-zone"
            ref="fileUpload"
            class="oc-flex oc-flex-middle oc-flex-center oc-placeholder"
            :btn-label="$gettext('Drop files here to upload or click to select file')"
          />
          <div id="previews" hidden />
        </div>
        <div v-if="errorMessage" class="oc-text-center">
          <h2>
            <span v-text="$gettext('An error occurred while loading the public link')" />
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

<script lang="ts">
import { mapGetters } from 'vuex'
import { DavProperties, DavProperty } from 'web-client/src/webdav/constants'
import { createLocationPublic } from '../router'

import ResourceUpload from '../components/AppBar/Upload/ResourceUpload.vue'
import { defineComponent, getCurrentInstance, onMounted, onBeforeUnmount, ref, unref } from 'vue'
import { useUpload } from 'web-runtime/src/composables/upload'
import * as uuid from 'uuid'
import {
  useClientService,
  usePublicLinkPassword,
  usePublicLinkToken,
  useStore,
  useRouter
} from 'web-pkg/src/composables'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { linkRoleUploaderFolder } from 'web-client/src/helpers/share'
import { useService } from 'web-pkg/src/composables/service'
import { UppyService } from 'web-runtime/src/services/uppyService'
import { useAuthService } from 'web-pkg/src/composables/authContext/useAuthService'

export default defineComponent({
  components: {
    ResourceUpload
  },
  setup() {
    const instance = getCurrentInstance().proxy as any
    const uppyService = useService<UppyService>('$uppyService')
    const store = useStore()
    const router = useRouter()
    const authService = useAuthService()
    const clientService = useClientService()
    const publicToken = usePublicLinkToken({ store })
    const publicLinkPassword = usePublicLinkPassword({ store })

    const share = ref()
    const dragareaEnabled = ref(false)
    const loading = ref(true)
    const errorMessage = ref(null)
    let filesSelectedSub
    let dragOver
    let dragOut
    let drop

    const hideDropzone = () => {
      dragareaEnabled.value = false
    }
    const onDragOver = (event) => {
      dragareaEnabled.value = (event.dataTransfer.types || []).some((e) => e === 'Files')
    }

    const resolvePublicLink = () => {
      loading.value = true
      clientService.owncloudSdk.publicFiles
        .list(unref(publicToken), unref(publicLinkPassword), DavProperties.PublicLink, '0')
        .then((files) => {
          // Redirect to files list if the link doesn't have role "uploader"
          const sharePermissions = parseInt(files[0].getProperty(DavProperty.PublicLinkPermission))
          if (linkRoleUploaderFolder.bitmask(false) !== sharePermissions) {
            router.replace(
              createLocationPublic('files-public-link', {
                params: { driveAliasAndItem: `public/${unref(publicToken)}` }
              })
            )
            return
          }
          share.value = files[0]
        })
        .catch((error) => {
          // likely missing password, redirect to public link password prompt
          if (error.statusCode === 401) {
            return authService.handleAuthError(unref(router.currentRoute))
          }
          console.error(error)
          errorMessage.value = error
        })
        .finally(() => {
          loading.value = false
        })
    }

    onMounted(() => {
      dragOver = eventBus.subscribe('drag-over', onDragOver)
      dragOut = eventBus.subscribe('drag-out', hideDropzone)
      drop = eventBus.subscribe('drop', hideDropzone)
      filesSelectedSub = uppyService.subscribe('filesSelected', instance.onFilesSelected) // FIXME
      uppyService.useDropTarget({
        targetSelector: '#files-drop-container',
        uppyService
      })
      resolvePublicLink()
    })

    onBeforeUnmount(() => {
      eventBus.unsubscribe('drag-over', dragOver)
      eventBus.unsubscribe('drag-out', dragOut)
      eventBus.unsubscribe('drop', drop)
      uppyService.unsubscribe('filesSelected', filesSelectedSub)
      uppyService.removeDropTarget()
    })

    return {
      ...useUpload({
        uppyService
      }),
      dragareaEnabled,
      loading,
      errorMessage,
      share
    }
  },
  computed: {
    ...mapGetters(['configuration']),
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
  methods: {
    onFilesSelected(files) {
      this.$uppyService.publish('uploadStarted')

      const uppyResources = files.map((file) => ({
        source: 'FileDrop',
        name: file.name,
        type: file.type,
        data: file,
        meta: {
          tusEndpoint: this.url,
          relativePath: file.webkitRelativePath || file.relativePath || '',
          uploadId: uuid.v4()
        }
      }))

      this.$uppyService.publish('addedForUpload', uppyResources)
      this.$uppyService.uploadFiles(uppyResources)
    }
  }
})
</script>

<style lang="scss">
#files-drop-container {
  position: relative;
  background: transparent;
  border: 1px dashed var(--oc-color-input-border);
  margin: var(--oc-space-xlarge);
}
.dragarea {
  background-color: rgba(60, 130, 225, 0.21);
  pointer-events: none;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  z-index: 9;
  border-radius: 14px;
  border: 2px dashed var(--oc-color-swatch-primary-muted);
}
</style>

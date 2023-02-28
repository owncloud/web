<template>
  <div class="oc-flex oc-flex-column oc-p-xl oc-pb-rm oc-flex-nowrap">
    <div class="oc-flex oc-flex-column oc-height-1-1">
      <div
        id="files-drop-container"
        class="oc-flex oc-flex-column oc-flex-between oc-flex-center oc-width-expand oc-flex-nowrap oc-p-m"
        :class="{ 'dragarea-enabled': dragareaEnabled }"
      >
        <div
          v-if="dragareaEnabled"
          class="dragarea oc-position-absolute oc-inset-0 oc-background-highlight oc-flex oc-flex-center oc-flex-column oc-flex-middle oc-p-m"
        >
          <div class="upload-icon oc-position-relative oc-mb-m oc-text-xlarge">
            <div class="box"></div>
            <div class="arrow oc-position-absolute oc-position-center"></div>
          </div>
          <h1 class="oc-text-normal" v-text="$gettext('Drop files here to upload')"></h1>
        </div>

        <h1 class="oc-invisible-sr">{{ pageTitle }}</h1>
        <div v-if="loading" key="loading-drop" class="oc-flex oc-flex-row oc-flex-middle">
          <h2 class="oc-login-card-title">
            <span v-text="$gettext('Loading public link…')" />
          </h2>
          <oc-spinner :aria-hidden="true" />
        </div>
        <div
          v-else
          key="loaded-drop"
          class="oc-flex oc-flex-column oc-height-1-1 oc-flex-middle oc-flex-center"
        >
          <div class="oc-text-center oc-width-1-1 oc-flex oc-flex-middle oc-flex-column">
            <div v-text="title" />
            <resource-upload
              id="files-drop-zone"
              ref="fileUpload"
              class="oc-flex oc-flex-middle oc-flex-center oc-placeholder"
              :btn-label="$gettext('Choose a file')"
              :btn-class="'oc-text-bold oc-button-l'"
            />
            <div id="previews" hidden />

            <upload-info :infoExpanded="true" :standalone="false" />
          </div>

          <div v-if="errorMessage" class="oc-text-center">
            <h2>
              <span v-text="$gettext('An error occurred while loading the public link')" />
            </h2>
            <p class="oc-m-rm" v-text="errorMessage" />
          </div>

          <div class="explanation oc-flex oc-flex-center oc-mt-l">
            <div class="oc-width-1-2@m oc-width-1-3@xl oc-pt-l">
              <h2 class="oc-text-center" v-text="$gettext('What is this?')" />
              <p
                v-text="
                  $gettext(
                    'You can upload files here simply by drag `n drop or click on “Choose a file“ to open a file selection box.'
                  )
                "
              />
              <p
                v-text="
                  $gettext(
                    'Since this an upload-only link you cannot see the contents existing within this resource. If you are not sure why you`re seeing this please contact the person who sent you the link or contact your local administrator.'
                  )
                "
              />
            </div>
          </div>
        </div>
      </div>
      <div class="oc-text-center">
        <p v-text="configuration.currentTheme.general.slogan" />
      </div>
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
import UploadInfo from 'web-runtime/src/components/UploadInfo.vue'

export default defineComponent({
  components: {
    ResourceUpload,
    UploadInfo
  },
  setup() {
    const instance = getCurrentInstance().proxy as any
    const uppyService = useService<UppyService>('$uppyService')

    const store = useStore()
    const router = useRouter()
    const authService = useAuthService()
    const { owncloudSdk } = useClientService()
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
      owncloudSdk.publicFiles
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

<style lang="scss" scoped>
#files-drop-container {
  position: relative;
  background: transparent;
  border: 3px dashed var(--oc-color-input-border);
  border-radius: 12px;
  transition: border 500ms ease-out;

  &.dragarea-enabled {
    border: 3px dashed var(--oc-color-swatch-primary-muted);
    transition: border 500ms ease-out;
  }

  .dragarea {
    pointer-events: none;
    z-index: 9;
    border-radius: 12px;

    .upload-icon {
      width: 50px;
      border: 3px solid var(--oc-color-text-default);
      border-top: none;
      height: 20px;
      border-radius: 4px;
      border-top-left-radius: 0;
      border-top-right-radius: 0;

      .arrow {
        -webkit-animation: bounce 1.5s infinite;
        animation: bounce 1.5s both infinite;
      }

      .arrow:before,
      .arrow:after {
        content: '';
        position: absolute;
        top: 0;
        right: -16px;
        width: 20px;
        height: 5px;
        border-radius: 10px;
        display: block;
        background: var(--oc-color-text-default);
        transform: rotate(-45deg);
        -webkit-transform: rotate(-45deg);
      }

      .arrow:after {
        right: inherit;
        left: -15px;
        transform: rotate(45deg);
        -webkit-transform: rotate(45deg);
      }
    }
  }

  .explanation {
    & > div {
      border-top: 1px solid var(--oc-color-input-border);
    }
  }
}

@-webkit-keyframes bounce {
  0% {
    -webkit-transform: translateY(-30xp);
    opacity: 0;
  }
  60% {
    opacity: 1;
  }
  100% {
    -webkit-transform: translateY(-10px);
    opacity: 0;
  }
}

@-moz-keyframes bounce {
  0% {
    -webkit-transform: translateY(-30px);
    opacity: 0;
  }
  60% {
    opacity: 1;
  }
  100% {
    -webkit-transform: translateY(-10px);
    opacity: 0;
  }
}

@-o-keyframes bounce {
  0% {
    -webkit-transform: translateY(-30px);
    opacity: 0;
  }
  60% {
    opacity: 1;
  }
  100% {
    -webkit-transform: translateY(-10px);
    opacity: 0;
  }
}
@keyframes bounce {
  0% {
    -webkit-transform: translateY(-30px);
    opacity: 0;
  }
  60% {
    opacity: 1;
  }
  100% {
    -webkit-transform: translateY(-10px);
    opacity: 0;
  }
}
</style>

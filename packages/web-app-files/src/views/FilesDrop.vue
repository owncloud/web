<template>
  <div id="files-drop">
    <app-loading-spinner v-if="loading" />
    <div v-else id="files-drop-container" class="oc-height-1-1">
      <h1 class="oc-invisible-sr">{{ pageTitle }}</h1>

      <div v-if="dragareaEnabled" class="dragarea" />
      <div key="loaded-drop" class="oc-flex oc-flex-center oc-height-1-1">
        <div class="foo-container oc-text-center">
          <div class="oc-flex oc-flex-column oc-flex-middle oc-flex-between oc-height-1-1">
            <!-- Visible title & upload CTA -->
            <div class="oc-width-1-1">
              <h2 v-text="title" />

              <!-- If no file upload yet start -->
              <p>
                {{ $gettext("Drop files here to upload or use the 'Upload' button.") }}
              </p>
              <div id="foo">
                <resource-upload
                  id="files-drop-zone"
                  ref="fileUpload"
                  class="oc-flex oc-flex-middle oc-flex-center oc-placeholder"
                >
                  <template v-slot="{ triggerUpload, uploadLabelId }">
                    <oc-button appearance="filled" variation="primary" @click="triggerUpload">
                      <span :id="uploadLabelId" v-text="$gettext('Upload')"></span>
                    </oc-button>
                  </template>
                </resource-upload>
              </div>
            </div>
            <!-- If no file upload yet end -->

            <!-- Once one file upload start -->
            <upload-info
              class="oc-width-1-1"
              :info-expanded-initial="true"
              :headless="true"
              :show-expand-details-button="false"
            />
            <!-- Once one file upload end -->

            <div v-if="errorMessage" class="oc-background-warning oc-width-1-1">
              <h2>
                <span v-text="$gettext('An error occurred while loading the public link')" />
              </h2>
              <p class="oc-rm-m oc-m-rm" v-text="errorMessage" />
            </div>
            <div v-else class="oc-width-1-1 oc-flex oc-flex-middle oc-background-muted oc-p-l">
              <oc-icon name="information"></oc-icon>
              <div class="oc-text-left oc-ml-m">
                <p v-text="existingContentNote" />
                <p v-text="flatFolderNote" />
              </div>
            </div>

            <div
              class="oc-width-1-1 oc-flex oc-flex-column oc-flex-middle oc-mb-l oc-p-m oc-background-brand"
            >
              <oc-img :src="themeLogo" alt="" class="oc-width-1-3" />
              <p class="oc-text-brand-contrast" v-text="themeSlogan" />
              <p
                v-if="!isCurrentThemeOwncloud"
                class="oc-text-brand-contrast"
                v-text="$gettext('This feature is brought to you by ownCloud')"
              />
              <oc-button
                type="a"
                appearance="raw"
                :variation="'primary'"
                size="small"
                :href="'https://owncloud.com/'"
                target="_blank"
              >
                {{ $gettext('Learn more about ownCloud') }}
              </oc-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { storeToRefs } from 'pinia'
import {
  computed,
  defineComponent,
  onMounted,
  onBeforeUnmount,
  ref,
  unref,
  nextTick,
  watch
} from 'vue'
import { useGettext } from 'vue3-gettext'

import {
  createFileRouteOptions,
  createLocationPublic,
  createLocationSpaces,
  eventBus,
  queryItemAsString,
  UppyService,
  useAuthService,
  useAuthStore,
  useClientService,
  useGetMatchingSpace,
  useMessages,
  useResourcesStore,
  useRoute,
  useRouteQuery,
  useRouter,
  useService,
  useSpacesStore,
  useThemeStore,
  useUpload,
  useUserStore
} from '@ownclouders/web-pkg'
import { HandleUpload } from 'web-app-files/src/HandleUpload'
import { PublicSpaceResource, SharePermissionBit } from '@ownclouders/web-client/src/helpers'
import UploadInfo from 'web-runtime/src/components/UploadInfo.vue'
import ResourceUpload from '../components/AppBar/Upload/ResourceUpload.vue'

export default defineComponent({
  components: {
    ResourceUpload,
    UploadInfo
  },
  setup() {
    const uppyService = useService<UppyService>('$uppyService')
    const userStore = useUserStore()
    const messageStore = useMessages()
    const themeStore = useThemeStore()
    const spacesStore = useSpacesStore()
    const router = useRouter()
    const route = useRoute()
    const language = useGettext()
    const { $gettext } = useGettext()
    const authService = useAuthService()
    const clientService = useClientService()
    const authStore = useAuthStore()
    const { getInternalSpace } = useGetMatchingSpace()
    useUpload({ uppyService })

    const resourcesStore = useResourcesStore()

    const { currentTheme } = storeToRefs(themeStore)
    const isCurrentThemeOwncloud = computed(() => currentTheme.value.common.name === 'ownCloud')
    const themeLogo = computed(() => currentTheme.value.logo.topbar)
    const themeSlogan = computed(() => currentTheme.value.common.slogan)

    const fileIdQueryItem = useRouteQuery('fileId')
    const fileId = computed(() => {
      return queryItemAsString(unref(fileIdQueryItem))
    })

    if (!uppyService.getPlugin('HandleUpload')) {
      uppyService.addPlugin(HandleUpload, {
        clientService,
        language,
        route,
        userStore,
        spacesStore,
        messageStore,
        resourcesStore,
        uppyService,
        quotaCheckEnabled: false,
        directoryTreeCreateEnabled: false,
        conflictHandlingEnabled: false
      })
    }

    const share = ref<PublicSpaceResource>()
    const dragareaEnabled = ref(false)
    const loading = ref(true)
    const errorMessage = ref(null)
    let dragOver
    let dragOut
    let drop

    const hideDropzone = () => {
      dragareaEnabled.value = false
    }
    const onDragOver = (event) => {
      dragareaEnabled.value = (event.dataTransfer.types || []).some((e) => e === 'Files')
    }

    const resolveToInternalLocation = (path: string) => {
      const internalSpace = getInternalSpace(unref(fileId).split('!')[0])
      if (internalSpace) {
        const routeOpts = createFileRouteOptions(internalSpace, { fileId: unref(fileId), path })
        return router.push(createLocationSpaces('files-spaces-generic', routeOpts))
      }

      // no internal space found -> share -> resolve via private link as it holds all the necessary logic
      return router.push({ name: 'resolvePrivateLink', params: { fileId: unref(fileId) } })
    }

    const resolvePublicLink = async () => {
      loading.value = true

      if (authStore.userContextReady && unref(fileId)) {
        try {
          const path = await clientService.webdav.getPathForFileId(unref(fileId))
          await resolveToInternalLocation(path)
          loading.value = false
          return
        } catch (e) {
          // getPathForFileId failed means the user doesn't have internal access to the resource
        }
      }

      const space = spacesStore.spaces.find(
        (s) => s.driveAlias === `public/${authStore.publicLinkToken}`
      )

      clientService.webdav
        .listFiles(space, {}, { depth: 0 })
        .then(({ resource }) => {
          // Redirect to files list if the link doesn't have role "uploader"
          // FIXME: check for type once https://github.com/owncloud/ocis/issues/8740 is resolved
          const sharePermissions = (resource as PublicSpaceResource).publicLinkPermission
          if (sharePermissions !== SharePermissionBit.Create) {
            router.replace(
              createLocationPublic('files-public-link', {
                params: { driveAliasAndItem: `public/${authStore.publicLinkToken}` }
              })
            )
            return
          }
          share.value = resource as PublicSpaceResource
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

    watch(loading, async (newLoadValue) => {
      if (!newLoadValue) {
        await nextTick()
        uppyService.useDropTarget({ targetSelector: '#files-drop-container' })
      } else {
        uppyService.removeDropTarget()
      }
    })

    onMounted(() => {
      dragOver = eventBus.subscribe('drag-over', onDragOver)
      dragOut = eventBus.subscribe('drag-out', hideDropzone)
      drop = eventBus.subscribe('drop', hideDropzone)
      resolvePublicLink()
    })

    onBeforeUnmount(() => {
      eventBus.unsubscribe('drag-over', dragOver)
      eventBus.unsubscribe('drag-out', dragOut)
      eventBus.unsubscribe('drop', drop)
      uppyService.removeDropTarget()
      uppyService.removePlugin(uppyService.getPlugin('HandleUpload'))
    })

    const pageTitle = computed(() => {
      return $gettext(route.value.meta.title as string)
    })

    const title = computed(() => {
      // share might not be loaded
      if (share.value) {
        return $gettext(
          '%{owner} is requesting files',
          { owner: share.value.publicLinkShareOwnerDisplayName },
          true
        )
      }
      return $gettext('Failed to load files. Please make sure your link is correct and try again.')
    })

    const existingContentNote = computed(() => {
      return $gettext(
        'Existing content is not revealed. Only %{owner} can see uploads.',
        { owner: share.value.publicLinkShareOwnerDisplayName },
        true
      )
    })

    const flatFolderNote = computed(() => {
      return $gettext(
        'Transfer of nested folder structures is not possible. Instead, all files from the subfolders will be uploaded individually.'
      )
    })

    return {
      dragareaEnabled,
      errorMessage,
      existingContentNote,
      flatFolderNote,
      isCurrentThemeOwncloud,
      loading,
      pageTitle,
      share,
      themeLogo,
      themeSlogan,
      title
    }
  }
})
</script>

<style lang="scss">
#files-drop {
  overflow-y: scroll;
  padding: var(--oc-space-large);

  &-container {
    background: transparent;
    border: none;

    @media (min-width: $oc-breakpoint-small-default) {
      border: 3px dashed var(--oc-color-input-border);

      border-radius: 14px;
    }

    position: relative;
  }

  &-info-message {
    @media only screen and (min-width: 1200px) {
      width: 400px;
    }
  }
}

.foo-container {
  width: 85%;
  @media (min-width: $oc-breakpoint-xsmall-max) {
    width: 70%;
  }
  @media (min-width: $oc-breakpoint-small-default) {
    width: 55%;
  }
  @media (min-width: $oc-breakpoint-medium-default) {
    width: 30%;
  }
}

.dragarea {
  border: none !important;
  background-color: rgba(60, 130, 225, 0.21);
  pointer-events: none;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  z-index: 9;
}
</style>

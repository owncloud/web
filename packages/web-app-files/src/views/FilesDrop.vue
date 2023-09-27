<template>
  <app-loading-spinner v-if="loading" />
  <div
    v-else
    id="files-drop-container"
    class="oc-height-1-1 oc-flex oc-flex-column oc-flex-between"
  >
    <div v-if="dragareaEnabled" class="dragarea" />
    <h1 class="oc-invisible-sr">{{ pageTitle }}</h1>
    <div class="oc-p oc-height-1-1">
      <div key="loaded-drop" class="oc-flex oc-flex-column oc-flex-middle">
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

      <div class="oc-text-center oc-mt-xxl">
        <p v-text="configuration.currentTheme.general.slogan" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { mapGetters } from 'vuex'
import { createLocationPublic, createLocationSpaces } from '@ownclouders/web-pkg'
import ResourceUpload from '../components/AppBar/Upload/ResourceUpload.vue'
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
import { useUpload } from 'web-runtime/src/composables/upload'
import { useGettext } from 'vue3-gettext'
import {
  useClientService,
  usePublicLinkToken,
  useStore,
  useRouter,
  useRoute,
  useCapabilitySpacesEnabled,
  useGetMatchingSpace,
  useUserContext,
  useRouteQuery,
  queryItemAsString
} from '@ownclouders/web-pkg'
import { eventBus } from '@ownclouders/web-pkg'
import { linkRoleUploaderFolder } from 'web-client/src/helpers/share'
import { useService } from '@ownclouders/web-pkg'
import { UppyService } from 'web-runtime/src/services/uppyService'
import { useAuthService } from '@ownclouders/web-pkg'
import { HandleUpload } from 'web-app-files/src/HandleUpload'
import { createFileRouteOptions } from '@ownclouders/web-pkg'
import { SpaceResource } from 'web-client/src'
import { PublicSpaceResource } from 'web-client/src/helpers'

export default defineComponent({
  components: {
    ResourceUpload
  },
  setup() {
    const uppyService = useService<UppyService>('$uppyService')
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    const language = useGettext()
    const hasSpaces = useCapabilitySpacesEnabled(store)
    const authService = useAuthService()
    const clientService = useClientService()
    const publicToken = usePublicLinkToken({ store })
    const isUserContext = useUserContext({ store })
    const { getInternalSpace } = useGetMatchingSpace()
    useUpload({ uppyService })

    const fileIdQueryItem = useRouteQuery('fileId')
    const fileId = computed(() => {
      return queryItemAsString(unref(fileIdQueryItem))
    })

    if (!uppyService.getPlugin('HandleUpload')) {
      uppyService.addPlugin(HandleUpload, {
        clientService,
        hasSpaces,
        language,
        route,
        store,
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

      if (unref(isUserContext) && unref(fileId)) {
        try {
          const path = await clientService.webdav.getPathForFileId(unref(fileId))
          await resolveToInternalLocation(path)
          loading.value = false
          return
        } catch (e) {
          // getPathForFileId failed means the user doesn't have internal access to the resource
        }
      }

      const spaces: SpaceResource[] = store.getters['runtime/spaces/spaces']
      const space = spaces.find((s) => s.driveAlias === `public/${unref(publicToken)}`)

      clientService.webdav
        .listFiles(space, {}, { depth: 0 })
        .then(({ resource }) => {
          // Redirect to files list if the link doesn't have role "uploader"
          const sharePermissions = (resource as PublicSpaceResource).publicLinkPermission
          if (linkRoleUploaderFolder.bitmask(false) !== sharePermissions) {
            router.replace(
              createLocationPublic('files-public-link', {
                params: { driveAliasAndItem: `public/${unref(publicToken)}` }
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

    return {
      dragareaEnabled,
      loading,
      errorMessage,
      share
    }
  },
  computed: {
    ...mapGetters(['configuration']),
    pageTitle() {
      return this.$gettext(this.$route.meta.title as string)
    },
    title() {
      // share might not be loaded
      if (this.share) {
        return this.$gettext(
          '%{owner} shared this folder with you for uploading',
          { owner: this.share.publicLinkShareOwner },
          true
        )
      }
      return ''
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

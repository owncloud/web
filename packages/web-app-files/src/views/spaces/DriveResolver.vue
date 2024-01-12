<template>
  <app-loading-spinner v-if="isLoading" />
  <template v-else>
    <app-banner :file-id="fileId"></app-banner>
    <drive-redirect v-if="!space" :drive-alias-and-item="driveAliasAndItem" />
    <generic-trash v-else-if="isTrashRoute" :space="space" :item-id="itemId" />
    <generic-space v-else :space="space" :item="item" :item-id="itemId" />
  </template>
</template>

<script lang="ts">
import DriveRedirect from './DriveRedirect.vue'
import GenericSpace from './GenericSpace.vue'
import GenericTrash from './GenericTrash.vue'

import { computed, defineComponent, onMounted, ref, unref } from 'vue'
import {
  queryItemAsString,
  useAuthStore,
  useClientService,
  useConfigurationManager,
  useDriveResolver,
  useGetMatchingSpace,
  useRouteParam,
  useRouteQuery,
  useRouter,
  useStore
} from '@ownclouders/web-pkg'
import { useActiveLocation } from '@ownclouders/web-pkg'
import { createLocationSpaces, isLocationTrashActive } from '@ownclouders/web-pkg'
import {
  isPublicSpaceResource,
  PublicSpaceResource,
  SpaceResource
} from '@ownclouders/web-client/src/helpers'
import { locationPublicUpload } from '@ownclouders/web-pkg'
import { linkRoleUploaderFolder } from '@ownclouders/web-client/src/helpers/share'
import { createFileRouteOptions } from '@ownclouders/web-pkg'
import { AppLoadingSpinner } from '@ownclouders/web-pkg'
import { dirname } from 'path'
import AppBanner from '@ownclouders/web-pkg/src/components/AppBanner.vue'

export default defineComponent({
  components: {
    AppBanner,
    DriveRedirect,
    GenericSpace,
    GenericTrash,
    AppLoadingSpinner
  },
  setup() {
    const store = useStore()
    const authStore = useAuthStore()
    const clientService = useClientService()
    const router = useRouter()
    const driveAliasAndItem = useRouteParam('driveAliasAndItem')
    const isTrashRoute = useActiveLocation(isLocationTrashActive, 'files-trash-generic')
    const resolvedDrive = useDriveResolver({ store, driveAliasAndItem })
    const { getInternalSpace } = useGetMatchingSpace()
    const configurationManager = useConfigurationManager()

    const loading = ref(true)
    const isLoading = computed(() => {
      return unref(loading) || unref(resolvedDrive.loading)
    })

    const fileIdQueryItem = useRouteQuery('fileId')
    const fileId = computed(() => {
      return queryItemAsString(unref(fileIdQueryItem))
    })

    const getSpaceResource = async (): Promise<SpaceResource> => {
      const space = unref(resolvedDrive.space)
      try {
        return (await clientService.webdav.getFileInfo(space)) as SpaceResource
      } catch (e) {
        console.error(e)
        return space
      }
    }

    const resolveToInternalLocation = async (path: string) => {
      const internalSpace = getInternalSpace(unref(fileId).split('!')[0])
      if (internalSpace) {
        const resource = await clientService.webdav.getFileInfo(internalSpace, { path })

        const resourceId = resource.type !== 'folder' ? resource.parentFolderId : resource.fileId
        const resourcePath = resource.type !== 'folder' ? dirname(path) : path
        resolvedDrive.space.value = internalSpace
        resolvedDrive.item.value = resourcePath

        const { params, query } = createFileRouteOptions(internalSpace, {
          fileId: resourceId,
          path: resourcePath
        })
        return router.push(
          createLocationSpaces('files-spaces-generic', {
            params,
            query: {
              ...query,
              scrollTo: unref(resource).fileId,
              ...(configurationManager.options.openLinksWithDefaultApp && {
                openWithDefaultApp: 'true'
              })
            }
          })
        )
      }

      // no internal space found -> share -> resolve via private link as it holds all the necessary logic
      return router.push({
        name: 'resolvePrivateLink',
        params: { fileId: unref(fileId) },
        query: {
          ...(configurationManager.options.openLinksWithDefaultApp && {
            openWithDefaultApp: 'true'
          })
        }
      })
    }

    onMounted(async () => {
      if (!unref(driveAliasAndItem) && unref(fileId)) {
        return router.push({
          name: 'resolvePrivateLink',
          params: { fileId: unref(fileId) },
          query: {
            ...(configurationManager.options.openLinksWithDefaultApp && {
              openWithDefaultApp: 'true'
            })
          }
        })
      }

      const space = unref(resolvedDrive.space)
      if (space && isPublicSpaceResource(space)) {
        const isRunningOnEos = store.getters.configuration?.options?.runningOnEos
        if (authStore.userContextReady && unref(fileId) && !isRunningOnEos) {
          try {
            const path = await clientService.webdav.getPathForFileId(unref(fileId))
            await resolveToInternalLocation(path)
            loading.value = false
            return
          } catch (e) {
            // getPathForFileId failed means the user doesn't have internal access to the resource
          }
        }

        let publicSpace = (await getSpaceResource()) as PublicSpaceResource

        if (linkRoleUploaderFolder.bitmask(false) === publicSpace.publicLinkPermission) {
          router.push({
            name: locationPublicUpload.name,
            params: { token: space.id.toString() }
          })
        }
      }

      loading.value = false
    })

    return {
      ...resolvedDrive,
      driveAliasAndItem,
      isTrashRoute,
      isLoading,
      fileId
    }
  }
})
</script>

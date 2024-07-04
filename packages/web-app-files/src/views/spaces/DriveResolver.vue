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
  useConfigStore,
  useDriveResolver,
  useGetMatchingSpace,
  useRouteParam,
  useRouteQuery,
  useRouter
} from '@ownclouders/web-pkg'
import { useActiveLocation } from '@ownclouders/web-pkg'
import { createLocationSpaces, isLocationTrashActive } from '@ownclouders/web-pkg'
import {
  isPublicSpaceResource,
  PublicSpaceResource,
  SharePermissionBit,
  SpaceResource
} from '@ownclouders/web-client'
import { locationPublicUpload } from '@ownclouders/web-pkg'
import { createFileRouteOptions } from '@ownclouders/web-pkg'
import { AppLoadingSpinner } from '@ownclouders/web-pkg'
import { dirname } from 'path'
import { AppBanner } from '@ownclouders/web-pkg'

export default defineComponent({
  components: {
    AppBanner,
    DriveRedirect,
    GenericSpace,
    GenericTrash,
    AppLoadingSpinner
  },
  setup() {
    const authStore = useAuthStore()
    const configStore = useConfigStore()
    const clientService = useClientService()
    const router = useRouter()
    const driveAliasAndItem = useRouteParam('driveAliasAndItem')
    const isTrashRoute = useActiveLocation(isLocationTrashActive, 'files-trash-generic')
    const resolvedDrive = useDriveResolver({ driveAliasAndItem })
    const { getInternalSpace } = useGetMatchingSpace()

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
        const resource = await clientService.webdav.getFileInfo(
          internalSpace,
          { path },
          { headers: { Authorization: `Bearer ${authStore.accessToken}` } }
        )

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
              ...(configStore.options.openLinksWithDefaultApp && {
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
          ...(configStore.options.openLinksWithDefaultApp && {
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
            ...(configStore.options.openLinksWithDefaultApp && {
              openWithDefaultApp: 'true'
            })
          }
        })
      }

      const space = unref(resolvedDrive.space)
      if (space && isPublicSpaceResource(space)) {
        const isRunningOnEos = configStore.options.runningOnEos
        if (authStore.userContextReady && unref(fileId) && !isRunningOnEos) {
          try {
            const path = await clientService.webdav.getPathForFileId(unref(fileId), {
              headers: { Authorization: `Bearer ${authStore.accessToken}` }
            })
            await resolveToInternalLocation(path)
            loading.value = false
            return
          } catch (e) {
            // getPathForFileId failed means the user doesn't have internal access to the resource
          }
        }

        /**
         * This is to make sure that an already resolved public link still resolves correctly
         * upon reload if the link type has been changed to "Uploader" meanwhile.
         * If the space ids differ, it means we're coming from the public link resolving page,
         * which already handled a potential link of type "Uploader".
         **/
        if (space.fileId === space.id) {
          let publicSpace = (await getSpaceResource()) as PublicSpaceResource

          // FIXME: check for type once https://github.com/owncloud/ocis/issues/8740 is resolved
          if (publicSpace.publicLinkPermission === SharePermissionBit.Create) {
            router.push({
              name: locationPublicUpload.name,
              params: { token: space.id.toString() }
            })
          }
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

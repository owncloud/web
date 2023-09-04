<template>
  <app-loading-spinner v-if="loading" />
  <template v-else>
    <drive-redirect
      v-if="!space"
      :drive-alias-and-item="driveAliasAndItem"
      :append-home-folder="isSpaceRoute"
    />
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
  useClientService,
  useDriveResolver,
  useGetMatchingSpace,
  useRouteParam,
  useRouteQuery,
  useRouter,
  useStore,
  useUserContext
} from 'web-pkg/src/composables'
import { useActiveLocation } from '../../composables'
import { createLocationSpaces, isLocationSpacesActive, isLocationTrashActive } from '../../router'
import { isPublicSpaceResource, PublicSpaceResource, SpaceResource } from 'web-client/src/helpers'
import { locationPublicUpload } from 'web-app-files/src/router/public'
import { linkRoleUploaderFolder } from 'web-client/src/helpers/share'
import { createFileRouteOptions } from 'web-pkg/src/helpers/router'
import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import { dirname } from 'path'

export default defineComponent({
  components: {
    DriveRedirect,
    GenericSpace,
    GenericTrash,
    AppLoadingSpinner
  },
  setup() {
    const store = useStore()
    const isUserContext = useUserContext({ store })
    const clientService = useClientService()
    const router = useRouter()
    const driveAliasAndItem = useRouteParam('driveAliasAndItem')
    const isSpaceRoute = useActiveLocation(isLocationSpacesActive, 'files-spaces-generic')
    const isTrashRoute = useActiveLocation(isLocationTrashActive, 'files-trash-generic')
    const resolvedDrive = useDriveResolver({ store, driveAliasAndItem })
    const { getInternalSpace } = useGetMatchingSpace()

    const loading = ref(true)

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
            query: { ...query, scrollTo: unref(resource).fileId }
          })
        )
      }

      // no internal space found -> share -> resolve via private link as it holds all the necessary logic
      return router.push({
        name: 'resolvePrivateLink',
        params: { fileId: unref(fileId) },
        query: { openWithDefaultApp: 'false' }
      })
    }

    onMounted(async () => {
      const space = unref(resolvedDrive.space)
      if (space && isPublicSpaceResource(space)) {
        const isRunningOnEos = store.getters.configuration?.options?.runningOnEos
        if (unref(isUserContext) && unref(fileId) && !isRunningOnEos) {
          try {
            const path = await clientService.owncloudSdk.files.getPathForFileId(unref(fileId))
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
      isSpaceRoute,
      isTrashRoute,
      loading
    }
  }
})
</script>

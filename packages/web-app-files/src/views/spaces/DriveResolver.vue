<template>
  <drive-redirect
    v-if="!space"
    :drive-alias-and-item="driveAliasAndItem"
    :append-home-folder="isSpaceRoute"
  />
  <generic-trash v-else-if="isTrashRoute" :space="space" :item-id="itemId" />
  <generic-space v-else :space="space" :item="item" :item-id="itemId" />
</template>

<script lang="ts">
import DriveRedirect from './DriveRedirect.vue'
import GenericSpace from './GenericSpace.vue'
import GenericTrash from './GenericTrash.vue'

import { defineComponent, onMounted, unref } from 'vue'
import {
  useClientService,
  useDriveResolver,
  useRouteParam,
  useRouter,
  useStore
} from 'web-pkg/src/composables'
import { useActiveLocation } from '../../composables'
import { isLocationSpacesActive, isLocationTrashActive } from '../../router'
import { isPublicSpaceResource, PublicSpaceResource, SpaceResource } from 'web-client/src/helpers'
import { locationPublicUpload } from 'web-app-files/src/router/public'
import { linkRoleUploaderFolder } from 'web-client/src/helpers/share'

export default defineComponent({
  components: {
    DriveRedirect,
    GenericSpace,
    GenericTrash
  },
  setup() {
    const store = useStore()
    const clientService = useClientService()
    const router = useRouter()
    const driveAliasAndItem = useRouteParam('driveAliasAndItem')
    const isSpaceRoute = useActiveLocation(isLocationSpacesActive, 'files-spaces-generic')
    const isTrashRoute = useActiveLocation(isLocationTrashActive, 'files-trash-generic')
    const resolvedDrive = useDriveResolver({ store, driveAliasAndItem })

    const getSpaceResource = async (): Promise<SpaceResource> => {
      const space = unref(resolvedDrive.space)
      try {
        return (await clientService.webdav.getFileInfo(space)) as SpaceResource
      } catch (e) {
        console.error(e)
        return space
      }
    }

    onMounted(async () => {
      const space = unref(resolvedDrive.space)
      if (space && isPublicSpaceResource(space)) {
        let publicSpace = (await getSpaceResource()) as PublicSpaceResource

        if (linkRoleUploaderFolder.bitmask(false) === publicSpace.publicLinkPermission) {
          router.push({
            name: locationPublicUpload.name,
            params: { token: space.id.toString() }
          })
        }
      }
    })

    return {
      ...resolvedDrive,
      driveAliasAndItem,
      isSpaceRoute,
      isTrashRoute
    }
  }
})
</script>

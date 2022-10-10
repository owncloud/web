<template>
  <div></div>
</template>

<script type="ts">
import {
  useRoute,
  useRouteParam,
  useStore,
  useTranslations,
  useUserContext,
  useRouter
} from "web-pkg/src/composables";
import { unref, ref, defineComponent, computed, onMounted } from "@vue/composition-api";
import { authService } from "../services/auth";
import { useLoadTokenInfo } from "../composables/tokenInfo";
import { clientService } from "web-pkg/src/services";
import { createLocationSpaces } from "files/src/router";
import {urlJoin} from "web-pkg/src/utils";

export default defineComponent({
  name: 'ResolveAliasLink',
  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    const token = useRouteParam('token')
    const { $gettext } = useTranslations()
    const isUserContext = useUserContext({ store })
    const { loadTokenInfoTask } = useLoadTokenInfo(unref(token))
    const tokenInfo = ref(undefined)

    onMounted(async () => {
      if (!unref(isUserContext)) {
        await authService.loginUser()
        return router.push({ name: '/login' })
      }

      tokenInfo.value = await loadTokenInfoTask.perform()
      resolveAliasLink()
    })

    const pageTitle = computed(() => $gettext(route.meta.title))

    const resolveAliasLink = async () => {
      const { id, storage_id: storageId, space_id: spaceId } = unref(tokenInfo)
      const path = await clientService.owncloudSdk.files.getPathForFileId(id)
      const matchingSpace = getMatchingSpace(`${storageId}$${spaceId}`)
      const resource = await clientService.webdav.getFileInfo(matchingSpace, { path })

      let driveAliasPath
      let scrollTo
      if (resource.type !== 'file') {
        driveAliasPath = path
        scrollTo = ''
      }  else {
        driveAliasPath = ''
        scrollTo = path
      }

      const location = createLocationSpaces('files-spaces-generic', {
        params: {
          driveAliasAndItem: matchingSpace.getDriveAliasAndItem({ path: driveAliasPath })
        },
        query: { scrollTo: urlJoin(scrollTo, { leadingSlash: false }) }
      })
      return router.push(location)
    }

    const getMatchingSpace = (spaceId) => {
      return store.getters['runtime/spaces/spaces'].find((space) => space.id === spaceId)
    }

    return {
      pageTitle,
    }
  }
})
</script>

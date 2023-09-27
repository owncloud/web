<template>
  <div
    class="oc-link-resolve oc-height-viewport oc-flex oc-flex-column oc-flex-center oc-flex-middle"
  >
    <div class="oc-card oc-text-center oc-width-large">
      <template v-if="loading">
        <div class="oc-card-header">
          <h2 key="private-link-loading">
            <span v-text="$gettext('Resolving private link…')" />
          </h2>
        </div>
        <div class="oc-card-body">
          <oc-spinner :aria-hidden="true" />
        </div>
      </template>
      <template v-else-if="errorMessage">
        <div class="oc-card-header oc-link-resolve-error-title">
          <h2 v-if="isUnacceptedShareError">
            {{ resource.name }}
          </h2>
          <h2 v-else key="private-link-error">
            <span v-text="$gettext('An error occurred while resolving the private link')" />
          </h2>
        </div>
        <div class="oc-card-body oc-link-resolve-error-message">
          <p class="oc-text-xlarge">{{ errorMessage }}</p>
          <p
            v-if="isUnacceptedShareError"
            v-text="$gettext('Note: You can reload this page after you accept the share.')"
          />
        </div>
      </template>
    </div>
    <oc-button
      v-if="isUnacceptedShareError"
      type="router-link"
      variation="primary"
      appearance="filled"
      target="_blank"
      class="oc-mt-m oc-text-center oc-width-medium"
      :to="sharedWithMeRoute"
    >
      <span class="text" v-text="openSharedWithMeLabel" />
    </oc-button>
  </div>
</template>

<script lang="ts">
import {
  useRouteParam,
  useStore,
  useRouter,
  queryItemAsString,
  useCapabilitySpacesEnabled,
  useClientService,
  useRouteQuery
} from '@ownclouders/web-pkg'
import { unref, defineComponent, computed, onMounted, ref, Ref } from 'vue'
// import { createLocationSpaces } from 'web-app-files/src/router'
import { dirname } from 'path'
import { createFileRouteOptions } from '@ownclouders/web-pkg/src/helpers/router'
import { useTask } from 'vue-concurrency'
import {
  buildShareSpaceResource,
  isMountPointSpaceResource,
  isPersonalSpaceResource,
  Resource,
  SpaceResource
} from 'web-client/src/helpers'
import { urlJoin } from 'web-client/src/utils'
import { configurationManager } from '@ownclouders/web-pkg'
import { RouteLocationRaw } from 'vue-router'
import { useLoadFileInfoById } from '../composables/fileInfo'
import { useGettext } from 'vue3-gettext'

export default defineComponent({
  name: 'ResolvePrivateLink',
  setup() {
    const store = useStore()
    const router = useRouter()
    const id = useRouteParam('fileId')
    const { $gettext } = useGettext()
    const hasSpaces = useCapabilitySpacesEnabled(store)
    const resource: Ref<Resource> = ref()
    const sharedParentResource: Ref<Resource> = ref()
    const isUnacceptedShareError = ref(false)

    const clientService = useClientService()

    const openWithDefaultAppQuery = useRouteQuery('openWithDefaultApp')
    const openWithDefaultApp = computed(() => queryItemAsString(unref(openWithDefaultAppQuery)))

    const detailsQuery = useRouteQuery('details')
    const details = computed(() => {
      return queryItemAsString(unref(detailsQuery))
    })

    onMounted(() => {
      resolvePrivateLinkTask.perform(queryItemAsString(unref(id)))
    })

    const { loadFileInfoByIdTask } = useLoadFileInfoById({ clientService })
    const resolvePrivateLinkTask = useTask(function* (signal, id) {
      let path
      let matchingSpace = getMatchingSpace(id)
      let resourceIsNestedInShare = false
      if (matchingSpace) {
        path = yield clientService.webdav.getPathForFileId(id)
        resource.value = yield clientService.webdav.getFileInfo(matchingSpace, { path })
      } else {
        // no matching space found => the file doesn't lie in own spaces => it's a share.
        // do PROPFINDs on parents until root of accepted share is found in `mountpoint` spaces
        yield store.dispatch('runtime/spaces/loadMountPoints', {
          graphClient: clientService.graphAuthenticated
        })
        let mountPoint = findMatchingMountPoint(id)
        resourceIsNestedInShare = !mountPoint
        resource.value = yield loadFileInfoByIdTask.perform(id)
        const sharePathSegments = mountPoint ? [] : [unref(resource).name]
        let tmpResource = unref(resource)
        while (!mountPoint) {
          try {
            tmpResource = yield loadFileInfoByIdTask.perform(tmpResource.parentFolderId)
          } catch (e) {
            isUnacceptedShareError.value = true
            throw Error(e)
          }
          sharedParentResource.value = tmpResource
          mountPoint = findMatchingMountPoint(tmpResource.id)
          if (!mountPoint) {
            sharePathSegments.unshift(tmpResource.name)
          }
        }
        matchingSpace = buildShareSpaceResource({
          shareId: mountPoint.nodeId,
          shareName: mountPoint.name,
          serverUrl: configurationManager.serverUrl
        })
        path = urlJoin(...sharePathSegments)
      }

      let fileId
      let targetLocation
      if (unref(resource).type === 'folder') {
        fileId = unref(resource).fileId
        targetLocation = 'files-spaces-generic'
      } else {
        fileId = unref(resource).parentFolderId
        path = dirname(path)
        // FIXME: we should not hardcode the name here, but we should not depend on
        // createLocationSpaces('files-spaces-generic') in web-app-files either
        targetLocation =
          matchingSpace.driveType === 'share' && !resourceIsNestedInShare
            ? 'files-shares-with-me'
            : 'files-spaces-generic'
      }

      const { params, query } = createFileRouteOptions(matchingSpace, { fileId, path })
      const location: RouteLocationRaw = {
        name: targetLocation,
        params,
        query: {
          ...query,
          scrollTo:
            targetLocation === 'files-shares-with-me'
              ? matchingSpace.shareId
              : unref(resource).fileId,
          ...(unref(details) && { details: unref(details) }),
          ...(configurationManager.options.openLinksWithDefaultApp &&
            unref(openWithDefaultApp) !== 'false' && {
              openWithDefaultApp: 'true'
            })
        }
      }
      router.push(location)
    })

    const getMatchingSpace = (id) => {
      if (!unref(hasSpaces)) {
        return store.getters['runtime/spaces/spaces'].find((space) =>
          isPersonalSpaceResource(space)
        )
      }
      return store.getters['runtime/spaces/spaces'].find((space) => id.startsWith(space.id))
    }

    const findMatchingMountPoint = (id: string | number): SpaceResource => {
      return store.getters['runtime/spaces/spaces'].find(
        (space) => isMountPointSpaceResource(space) && space.root?.remoteItem?.id === id
      )
    }

    const loading = computed(() => {
      return !resolvePrivateLinkTask.last || resolvePrivateLinkTask.isRunning
    })

    const sharedWithMeRoute = computed(() => {
      return { name: 'files-shares-with-me' }
    })

    const openSharedWithMeLabel = computed(() => {
      return $gettext('Open "Shared with me"')
    })

    const errorMessage = computed(() => {
      if (unref(isUnacceptedShareError)) {
        if (
          !unref(sharedParentResource) ||
          unref(resource).name === unref(sharedParentResource).name
        ) {
          if (unref(resource).type === 'file') {
            return $gettext(
              'This file has been shared with you. Accept it in "Shares" > "Shared with me" to view it.'
            )
          }
          return $gettext(
            'This folder has been shared with you. Accept it in "Shares" > "Shared with me" to view it.'
          )
        }

        let translated
        if (unref(resource).type === 'file') {
          return $gettext(
            'This file has been shared with you via "%{parentShareName}". Accept the share "%{parentShareName}" in "Shares" > "Shared with me" to view it.',
            {
              parentShareName: unref(sharedParentResource).name
            }
          )
        } else {
          return $gettext(
            'This folder has been shared with you via "%{parentShareName}". Accept the share "%{parentShareName}" in "Shares" > "Shared with me" to view it.',
            {
              parentShareName: unref(sharedParentResource).name
            }
          )
        }
      }

      if (resolvePrivateLinkTask.isError) {
        return resolvePrivateLinkTask.last.error.message
      }
      return null
    })

    return {
      errorMessage,
      loading,
      resource,
      isUnacceptedShareError,
      sharedWithMeRoute,
      openSharedWithMeLabel
    }
  }
})
</script>

<style lang="scss">
.oc-link-resolve {
  .oc-card {
    background: var(--oc-color-background-highlight);
    border-radius: 15px;
  }

  .oc-card-header h2 {
    margin: 0;
  }
}
</style>

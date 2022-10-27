<template>
  <div class="oc-height-1-1 oc-link-resolve">
    <div class="oc-link-resolve-wrapper oc-flex oc-flex-center oc-flex-middle">
      <h1 class="oc-invisible-sr">{{ pageTitle }}</h1>
      <div class="oc-card oc-text-center oc-width-medium">
        <template v-if="loading">
          <div class="oc-card-body">
            <h2 key="private-link-loading">
              <translate>Resolving private link…</translate>
            </h2>
            <oc-spinner class="oc-mt-m" :aria-hidden="true" />
          </div>
        </template>
        <template v-else-if="errorMessage">
          <div class="oc-card-body oc-link-resolve-error-message">
            <h2 v-if="isUnacceptedShareError" class="oc-link-resolve-error-title">
              {{ resource.name }}
            </h2>
            <h2 v-else key="private-link-error" class="oc-link-resolve-error-title">
              <translate>An error occurred while resolving the private link</translate>
            </h2>
            <p>{{ errorMessage }}</p>
            <p
              v-if="isUnacceptedShareError"
              v-text="$gettext('Note: You can reload this page after you accept the share.')"
            ></p>
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
  </div>
</template>

<script lang="ts">
import {
  useRoute,
  useRouteParam,
  useStore,
  useTranslations,
  useRouter,
  queryItemAsString,
  useCapabilitySpacesEnabled,
  useClientService
} from 'web-pkg/src/composables'
import { unref, defineComponent, computed, onMounted, ref, Ref } from '@vue/composition-api'
// import { createLocationSpaces } from 'web-app-files/src/router'
import { dirname } from 'path'
import { createFileRouteOptions } from 'web-pkg/src/helpers/router'
import { useTask } from 'vue-concurrency'
import {
  buildShareSpaceResource,
  isMountPointSpaceResource,
  isPersonalSpaceResource,
  Resource,
  SpaceResource
} from 'web-client/src/helpers'
import { urlJoin } from 'web-client/src/utils'
import { configurationManager } from 'web-pkg/src/configuration'
import { RawLocation } from 'vue-router'
import { useLoadFileInfoById } from '../composables/fileInfo'

export default defineComponent({
  name: 'ResolvePrivateLink',
  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    const id = useRouteParam('fileId')
    const { $gettext, $gettextInterpolate } = useTranslations()
    const hasSpaces = useCapabilitySpacesEnabled(store)
    const resource: Ref<Resource> = ref()
    const sharedParentResource: Ref<Resource> = ref()
    const isUnacceptedShareError = ref(false)

    const pageTitle = computed(() => $gettext(unref(route).meta.title))
    const configuration = computed(() => {
      return store.getters.configuration
    })
    const clientService = useClientService()

    onMounted(() => {
      resolvePrivateLinkTask.perform(queryItemAsString(unref(id)))
    })

    const { loadFileInfoByIdTask } = useLoadFileInfoById({ clientService })
    const resolvePrivateLinkTask = useTask(function* (signal, id) {
      let path
      let matchingSpace = getMatchingSpace(id)
      if (matchingSpace) {
        path = yield clientService.owncloudSdk.files.getPathForFileId(id)
        resource.value = yield clientService.webdav.getFileInfo(matchingSpace, { path })
      } else {
        // no matching space found => the file doesn't lie in own spaces => it's a share.
        // do PROPFINDs on parents until root of accepted share is found in `mountpoint` spaces
        let mountPoint = findMatchingMountPoint(id)
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
      let scrollTo
      if (unref(resource).type === 'folder') {
        fileId = unref(resource).fileId
      } else {
        fileId = unref(resource).parentFolderId
        scrollTo = unref(resource).name
        path = dirname(path)
      }

      const { params, query } = createFileRouteOptions(matchingSpace, { fileId, path })
      // FIXME: we should not hardcode the name here, but we should not depend on
      // createLocationSpaces('files-spaces-generic') in web-app-files either
      const location: RawLocation = {
        name: 'files-spaces-generic',
        params,
        query: { ...query, ...(scrollTo && { scrollTo }) }
      }
      return router.push(location)
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
          translated = $gettext(
            'This file has been shared with you via "%{parentShareName}". Accept the share "%{parentShareName}" in "Shares" > "Shared with me" to view it.'
          )
        } else {
          translated = $gettext(
            'This folder has been shared with you via "%{parentShareName}". Accept the share "%{parentShareName}" in "Shares" > "Shared with me" to view it.'
          )
        }

        return $gettextInterpolate(translated, {
          parentShareName: unref(sharedParentResource).name
        })
      }

      if (resolvePrivateLinkTask.isError) {
        return resolvePrivateLinkTask.last.error
      }
      return null
    })

    return {
      pageTitle,
      configuration,
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
  &-wrapper {
    flex-flow: column;
    min-height: 96vh;
  }

  .oc-card {
    background: var(--oc-color-background-highlight);
    border-radius: 15px;
  }

  h2 {
    font-size: var(--oc-font-size-medium);
    margin: 0;
  }
}
</style>

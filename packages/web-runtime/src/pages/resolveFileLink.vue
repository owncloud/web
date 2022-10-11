<template>
  <div class="oc-height-1-1 oc-link-resolve">
    <h1 class="oc-invisible-sr">{{ pageTitle }}</h1>
    <div class="oc-card oc-border oc-rounded oc-position-center oc-text-center oc-width-large">
      <template v-if="loading">
        <div class="oc-card-header">
          <h2 key="private-link-loading">
            <translate>Resolving private link…</translate>
          </h2>
        </div>
        <div class="oc-card-body">
          <oc-spinner :aria-hidden="true" />
        </div>
      </template>
      <template v-else-if="errorMessage">
        <div class="oc-card-header oc-link-resolve-error-title">
          <h2 key="private-link-error">
            <translate>An error occurred while resolving the private link</translate>
          </h2>
        </div>
        <div class="oc-card-body oc-link-resolve-error-message">
          <p class="oc-text-xlarge">{{ errorMessage }}</p>
        </div>
      </template>
      <div class="oc-card-footer">
        <p>
          {{ configuration.currentTheme.general.slogan }}
        </p>
      </div>
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
  useCapabilitySpacesEnabled
} from 'web-pkg/src/composables'
import { unref, defineComponent, computed, onMounted } from '@vue/composition-api'
import { clientService } from 'web-pkg/src/services'
import { createLocationSpaces } from 'files/src/router'
import { dirname } from 'path'
import { createFileRouteOptions } from 'web-pkg/src/helpers/router'
import { useTask } from 'vue-concurrency'
import {
  buildShareSpaceResource,
  buildSpace,
  buildWebDavSpacesPath,
  isMountPointSpaceResource,
  isPersonalSpaceResource,
  Resource,
  SpaceResource
} from 'web-client/src/helpers'
import { DavProperty } from 'web-pkg/src/constants'
import { urlJoin } from 'web-pkg/src/utils'
import { configurationManager } from 'web-pkg/src/configuration'

export default defineComponent({
  name: 'ResolveFileLink',
  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    const id = useRouteParam('fileId')
    const { $gettext } = useTranslations()
    const hasSpaces = useCapabilitySpacesEnabled(store)

    const pageTitle = computed(() => $gettext(unref(route).meta.title))
    const configuration = computed(() => {
      return store.getters.configuration
    })

    onMounted(() => {
      resolveFileLinkTask.perform(queryItemAsString(unref(id)))
    })

    const resolveFileLinkTask = useTask(function* (signal, id) {
      let path, resource
      let matchingSpace = getMatchingSpace(id)
      if (matchingSpace) {
        path = yield clientService.owncloudSdk.files.getPathForFileId(id)
        resource = yield clientService.webdav.getFileInfo(matchingSpace, { path })
      } else {
        // no matching space found => the file doesn't lie in own spaces => it's a share.
        // do PROPFINDs on parents until root of accepted share is found in `mountpoint` spaces
        let mountPoint = findMatchingMountPoint(id)
        resource = yield fetchFileInfoById(id)
        const sharePathSegments = mountPoint ? [] : [resource.name]
        let tmpResource = resource
        while (!mountPoint) {
          tmpResource = yield fetchFileInfoById(tmpResource.parentFolderId)
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
      if (resource.type === 'folder') {
        fileId = resource.fileId
      } else {
        fileId = resource.parentFolderId
        scrollTo = resource.name
        path = dirname(path)
      }

      const { params, query } = createFileRouteOptions(matchingSpace, { fileId, path })
      const location = createLocationSpaces('files-spaces-generic', {
        params,
        query: { ...query, ...(scrollTo && { scrollTo }) }
      })
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

    const fetchFileInfoById = async (id: string | number): Promise<Resource> => {
      const space = buildSpace({
        id,
        webDavPath: buildWebDavSpacesPath(id)
      })
      return await clientService.webdav.getFileInfo(
        space,
        {},
        {
          davProperties: [
            DavProperty.FileId,
            DavProperty.FileParent,
            DavProperty.Name,
            DavProperty.ResourceType
          ]
        }
      )
    }

    const findMatchingMountPoint = (id: string | number): SpaceResource => {
      return store.getters['runtime/spaces/spaces'].find(
        (space) => isMountPointSpaceResource(space) && space.root?.remoteItem?.id === id
      )
    }

    const loading = computed(() => {
      return !resolveFileLinkTask.last || resolveFileLinkTask.isRunning
    })

    const errorMessage = computed(() => {
      if (resolveFileLinkTask.isError) {
        return resolveFileLinkTask.last.error
      }
      return null
    })

    return {
      pageTitle,
      configuration,
      errorMessage,
      loading
    }
  }
})
</script>

<style lang="scss">
.oc-link-resolve {
  .oc-card-header h2,
  .oc-card-footer p {
    margin: 0;
  }
}
</style>

<template>
  <div id="oc-file-versions-sidebar" class="-oc-mt-s">
    <oc-loader v-if="areVersionsLoading" />
    <ul v-else-if="versions.length" class="oc-m-rm oc-position-relative">
      <li class="spacer oc-pb-l" aria-hidden="true"></li>
      <li
        v-for="(item, index) in versions"
        :key="index"
        class="version-item oc-pb-m oc-position-relative"
      >
        <div class="version-details">
          <span
            v-oc-tooltip="formatVersionDate(item)"
            class="version-date oc-font-semibold"
            data-testid="file-versions-file-last-modified-date"
            >{{ formatVersionDateRelative(item) }}</span
          >
          -
          <span class="version-filesize" data-testid="file-versions-file-size">{{
            formatVersionFileSize(item)
          }}</span>
        </div>
        <oc-list id="oc-file-versions-sidebar-actions" class="oc-pt-xs">
          <li v-if="isRevertible">
            <oc-button
              data-testid="file-versions-revert-button"
              appearance="raw"
              :aria-label="$gettext('Restore')"
              class="version-action-item oc-width-1-1 oc-rounded oc-button-justify-content-left oc-button-gap-m oc-py-s oc-px-m oc-display-block"
              @click="revertToVersion(item)"
            >
              <oc-icon name="history" class="oc-icon-m oc-mr-s -oc-mt-xs" fill-type="line" />
              {{ $gettext('Restore') }}
            </oc-button>
          </li>
          <li>
            <oc-button
              data-testid="file-versions-download-button"
              appearance="raw"
              :aria-label="$gettext('Download')"
              class="version-action-item oc-width-1-1 oc-rounded oc-button-justify-content-left oc-button-gap-m oc-py-s oc-px-m oc-display-block"
              @click="downloadVersion(item)"
            >
              <oc-icon name="file-download" class="oc-icon-m oc-mr-s" fill-type="line" />
              {{ $gettext('Download') }}
            </oc-button>
          </li>
        </oc-list>
      </li>
    </ul>
    <div v-else>
      <p v-translate data-testid="file-versions-no-versions">No Versions available for this file</p>
    </div>
  </div>
</template>
<script lang="ts">
import { DavPermission } from '@ownclouders/web-client/src/webdav/constants'
import {
  formatRelativeDateFromHTTP,
  formatDateFromJSDate,
  formatFileSize,
  useClientService,
  useDownloadFile,
  useStore
} from '@ownclouders/web-pkg'
import { computed, defineComponent, inject, Ref, unref, watch } from 'vue'
import { isShareSpaceResource, Resource, SpaceResource } from '@ownclouders/web-client/src/helpers'
import { SharePermissions } from '@ownclouders/web-client/src/helpers/share'
import { useTask } from 'vue-concurrency'
import { useGettext } from 'vue3-gettext'

export default defineComponent({
  name: 'FileVersions',
  props: {
    isReadOnly: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  setup(props) {
    const store = useStore()
    const clientService = useClientService()
    const { current: currentLanguage } = useGettext()
    const { downloadFile } = useDownloadFile({ clientService })

    const space = inject<Ref<SpaceResource>>('space')
    const resource = inject<Ref<Resource>>('resource')

    const versions = computed(() => {
      return store.getters['Files/versions']
    })

    const fetchVersionsTask = useTask(function* () {
      yield store.dispatch('Files/loadVersions', {
        client: clientService.webdav,
        fileId: unref(resource).fileId
      })
    })
    const areVersionsLoading = computed(() => {
      return !fetchVersionsTask.last || fetchVersionsTask.isRunning
    })
    watch(
      [() => unref(resource)?.id, () => unref(resource)?.etag],
      ([id, etag]) => {
        if (!id || !etag) {
          return
        }
        fetchVersionsTask.perform()
      },
      {
        immediate: true
      }
    )

    const isRevertible = computed(() => {
      if (props.isReadOnly) {
        return false
      }

      if (isShareSpaceResource(unref(space)) || unref(resource).isReceivedShare()) {
        if (unref(resource).permissions !== undefined) {
          return unref(resource).permissions.includes(DavPermission.Updateable)
        }
        if (unref(resource).share?.role) {
          return unref(resource).share.role.hasPermission(SharePermissions.update)
        }
      }

      return true
    })

    const revertToVersion = async (version: Resource) => {
      await clientService.webdav.restoreFileVersion(unref(space), unref(resource), version.name)
      const restoredResource = await clientService.webdav.getFileInfo(unref(space), unref(resource))

      const fieldsToUpdate = ['size', 'mdate']
      for (const field of fieldsToUpdate) {
        if (Object.prototype.hasOwnProperty.call(unref(resource), field)) {
          store.commit('Files/UPDATE_RESOURCE_FIELD', {
            id: unref(resource).id,
            field,
            value: restoredResource[field]
          })
        }
      }

      fetchVersionsTask.perform()
    }
    const downloadVersion = (version: Resource) => {
      return downloadFile(unref(resource), version.name)
    }
    const formatVersionDateRelative = (version: Resource) => {
      return formatRelativeDateFromHTTP(version.mdate, currentLanguage)
    }
    const formatVersionDate = (version: Resource) => {
      return formatDateFromJSDate(new Date(version.mdate), currentLanguage)
    }
    const formatVersionFileSize = (version: Resource) => {
      return formatFileSize(version.size, currentLanguage)
    }

    return {
      space,
      resource,
      versions,
      areVersionsLoading,
      isRevertible,
      revertToVersion,
      downloadVersion,
      formatVersionDateRelative,
      formatVersionDate,
      formatVersionFileSize,

      // HACK: exported for unit tests
      fetchVersionsTask
    }
  }
})
</script>

<style lang="scss" scoped>
#oc-file-versions-sidebar {
  > ul {
    list-style: none;

    .spacer {
      border-left: 1px solid var(--oc-color-border);
      margin-left: calc(-1 * var(--oc-space-large)) !important;
    }

    > li.version-item {
      border-left: 1px solid var(--oc-color-border);
      margin-left: calc(-1 * var(--oc-space-large)) !important;
      padding-left: var(--oc-space-medium);
      padding-bottom: var(--oc-space-medium);
      margin-top: calc(-1 * var(--oc-space-small));

      &::before {
        content: '';
        display: block;
        width: 11px;
        height: 11px;
        position: absolute;
        left: -6px;
        top: 4px;
        background-color: var(--oc-color-border);
        border-radius: 50%;
      }

      button.version-action-item {
        &:hover {
          color: var(--oc-color-primary-contrast);
          background-color: var(--oc-color-background-hover);
        }

        .oc-icon {
          vertical-align: middle;
        }
      }

      &:last-child {
        border-left: 1px solid transparent;
      }
    }
  }
}
</style>

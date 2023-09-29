<template>
  <div id="oc-file-versions-sidebar" class="-oc-mt-s">
    <oc-loader v-if="loading" />
    <ul v-if="!loading && hasVersion" class="oc-m-rm oc-position-relative">
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
          <li v-if="isRevertable">
            <oc-button
              data-testid="file-versions-revert-button"
              appearance="raw"
              :aria-label="$gettext('Restore')"
              class="version-action-item oc-width-1-1 oc-rounded oc-button-justify-content-left oc-button-gap-m oc-py-s oc-px-m oc-display-block"
              @click="revertVersion(item)"
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
import { mapActions, mapGetters, mapMutations } from 'vuex'
import { DavPermission, DavProperty } from '@ownclouders/web-client/src/webdav/constants'
import { formatRelativeDateFromHTTP, formatFileSize } from '@ownclouders/web-pkg'
import { WebDAV } from '@ownclouders/web-client/src/webdav'
import { defineComponent, inject, ref, Ref } from 'vue'
import { isShareSpaceResource, Resource, SpaceResource } from '@ownclouders/web-client/src/helpers'
import { SharePermissions } from '@ownclouders/web-client/src/helpers/share'
import { useClientService } from '@ownclouders/web-pkg/src/composables'
import { formatDateFromJSDate } from '@ownclouders/web-pkg'
import { useDownloadFile } from '@ownclouders/web-pkg'

export default defineComponent({
  name: 'FileVersions',
  setup() {
    const clientService = useClientService()
    const loading = ref(false)

    return {
      ...useDownloadFile(),
      space: inject<Ref<SpaceResource>>('space'),
      resource: inject<Ref<Resource>>('resource'),
      clientService,
      loading
    }
  },
  computed: {
    ...mapGetters('Files', ['versions']),
    hasVersion() {
      return this.versions.length > 0
    },
    isRevertable() {
      if ((this.space && isShareSpaceResource(this.space)) || this.resource.isReceivedShare()) {
        if (this.resource.permissions !== undefined) {
          return this.resource.permissions.includes(DavPermission.Updateable)
        }

        if (this.resource.share?.role) {
          return this.resource.share.role.hasPermission(SharePermissions.update)
        }
      }

      return true
    }
  },
  watch: {
    resource() {
      if (this.resource) {
        this.fetchFileVersions()
      }
    }
  },
  mounted() {
    this.fetchFileVersions()
  },
  methods: {
    ...mapActions('Files', ['loadVersions']),
    ...mapMutations('Files', ['UPDATE_RESOURCE_FIELD']),
    currentVersionId(file) {
      const etag = file.name.split('/')
      return etag[etag.length - 1]
    },
    async fetchFileVersions() {
      this.loading = true
      await this.loadVersions({ client: this.$client, fileId: this.resource.fileId })
      this.loading = false
    },
    async revertVersion(file) {
      const { id } = this.resource
      await this.clientService.webdav.restoreFileVersion(
        this.space,
        this.resource,
        this.currentVersionId(file)
      )
      const resource = await (this.$clientService.webdav as WebDAV).getFileInfo(
        this.space,
        this.resource
      )

      const fieldsToUpdate = ['size', 'mdate']
      for (const field of fieldsToUpdate) {
        if (this.resource[field]) {
          this.UPDATE_RESOURCE_FIELD({ id, field, value: resource[field] })
        }
      }

      this.fetchFileVersions()
    },
    downloadVersion(file) {
      const version = this.currentVersionId(file)
      return this.downloadFile(this.resource, version)
    },
    formatVersionDateRelative(file) {
      return formatRelativeDateFromHTTP(
        file.fileInfo[DavProperty.LastModifiedDate],
        this.$language.current
      )
    },
    formatVersionDate(file) {
      return formatDateFromJSDate(
        new Date(file.fileInfo[DavProperty.LastModifiedDate]),
        this.$language.current
      )
    },
    formatVersionFileSize(file) {
      return formatFileSize(file.fileInfo[DavProperty.ContentLength], this.$language.current)
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

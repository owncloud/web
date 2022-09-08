<template>
  <div id="oc-file-versions-sidebar">
    <oc-loader v-if="loading" />
    <oc-table-simple v-if="!loading && hasVersion">
      <oc-tbody>
        <oc-tr v-for="(item, index) in versions" :key="index" class="file-row">
          <oc-td width="shrink" data-testid="file-versions-file-icon">
            <oc-resource-icon :resource="highlightedFile" size="medium" />
          </oc-td>
          <oc-td
            width="shrink"
            class="oc-text-muted oc-text-nowrap"
            data-testid="file-versions-file-last-modified-date"
          >
            {{ formatVersionDate(item) }}
          </oc-td>
          <oc-td class="oc-text-muted oc-text-nowrap" data-testid="file-versions-file-size">
            {{ formatVersionFileSize(item) }}
          </oc-td>
          <oc-td width="shrink">
            <oc-button
              v-oc-tooltip="$gettext('Restore older version')"
              data-testid="file-versions-revert-button"
              appearance="raw"
              :aria-label="$gettext('Restore older version')"
              @click="revertVersion(item)"
            >
              <oc-icon name="restart" fill-type="line" />
            </oc-button>
          </oc-td>
          <oc-td width="shrink">
            <oc-button
              v-oc-tooltip="$gettext('Download older version')"
              data-testid="file-versions-download-button"
              appearance="raw"
              :aria-label="$gettext('Download older version')"
              @click="downloadVersion(item)"
            >
              <oc-icon name="download-cloud" fill-type="line" />
            </oc-button>
          </oc-td>
        </oc-tr>
      </oc-tbody>
    </oc-table-simple>
    <div v-else>
      <p v-translate data-testid="file-versions-no-versions">No Versions available for this file</p>
    </div>
  </div>
</template>
<script lang="ts">
import { mapActions, mapGetters, mapMutations } from 'vuex'
import { DavProperties, DavProperty } from 'web-pkg/src/constants'
import { formatRelativeDateFromHTTP, formatFileSize } from 'web-pkg/src/helpers'
import { buildResource } from '../../../helpers/resources'

export default {
  name: 'FileVersions',
  data: () => ({
    loading: false,
    DavProperty
  }),
  computed: {
    ...mapGetters('Files', ['highlightedFile', 'versions']),
    hasVersion() {
      return this.versions.length > 0
    }
  },
  watch: {
    highlightedFile() {
      this.fetchFileVersions()
    }
  },
  mounted() {
    this.fetchFileVersions()
  },
  methods: {
    ...mapActions('Files', ['loadVersions']),
    ...mapMutations('Files', ['UPDATE_RESOURCE']),
    currentVersionId(file) {
      const etag = file.name.split('/')
      return etag[etag.length - 1]
    },
    async fetchFileVersions() {
      this.loading = true
      await this.loadVersions({ client: this.$client, fileId: this.highlightedFile.fileId })
      this.loading = false
    },
    revertVersion(file) {
      this.$client.fileVersions
        .restoreFileVersion(
          this.highlightedFile.id,
          this.currentVersionId(file),
          this.highlightedFile.path
        )
        .then(() => {
          this.$client.files
            .fileInfo(this.highlightedFile.webDavPath, DavProperties.Default)
            .then((fileInfo) => {
              const resource = buildResource(fileInfo)
              this.UPDATE_RESOURCE(resource)
            })
          this.fetchFileVersions()
        })
    },
    downloadVersion(file) {
      const version = this.currentVersionId(file)
      return this.downloadFile(this.highlightedFile, version)
    },
    formatVersionDate(file) {
      return formatRelativeDateFromHTTP(
        file.fileInfo[DavProperty.LastModifiedDate],
        this.$language.current
      )
    },
    formatVersionFileSize(file) {
      return formatFileSize(file.fileInfo[DavProperty.ContentLength], this.$language.current)
    }
  }
}
</script>

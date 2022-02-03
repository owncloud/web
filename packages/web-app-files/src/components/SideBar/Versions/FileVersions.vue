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
            {{ formRelativeDateFromHTTP(item.fileInfo[DavProperty.LastModifiedDate]) }}
          </oc-td>
          <oc-td class="oc-text-muted oc-text-nowrap" data-testid="file-versions-file-size">
            {{ getResourceSize(item.fileInfo[DavProperty.ContentLength]) }}
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
<script>
import Mixins from '../../../mixins'
import MixinResources from '../../../mixins/resources'
import { mapActions, mapGetters } from 'vuex'
import { DavProperty } from 'web-pkg/src/constants'

export default {
  name: 'FileVersions',
  mixins: [Mixins, MixinResources],
  title: ($gettext) => {
    return $gettext('Versions')
  },
  data: () => ({
    loading: false,
    DavProperty
  }),
  computed: {
    ...mapGetters('Files', ['highlightedFile', 'versions']),
    ...mapGetters(['getToken']),
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
    currentVersionId(file) {
      const etag = file.name.split('/')
      return etag[etag.length - 1]
    },
    async fetchFileVersions() {
      this.loading = true
      await this.loadVersions({ client: this.$client, fileId: this.highlightedFile.id })
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
          this.fetchFileVersions()
        })
    },
    downloadVersion(file) {
      const version = this.currentVersionId(file)
      return this.downloadFile(this.highlightedFile, null, version)
    }
  }
}
</script>

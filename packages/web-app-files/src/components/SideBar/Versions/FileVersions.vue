<template>
  <div id="oc-file-versions-sidebar">
    <oc-loader v-if="loading" />
    <oc-table-simple v-if="!loading && hasVersion">
      <oc-tbody>
        <oc-tr v-for="(item, index) in versions" :key="index" class="file-row">
          <oc-td width="shrink">
            <oc-icon :name="fileTypeIcon(highlightedFile)" />
          </oc-td>
          <oc-td width="shrink" class="oc-text-muted uk-text-nowrap">
            {{ formDateFromNow(item.fileInfo['{DAV:}getlastmodified'], 'Http') }}
          </oc-td>
          <oc-td width="expand" class="oc-text-muted uk-text-nowrap">
            {{ getResourceSize(item.fileInfo['{DAV:}getcontentlength']) }}
          </oc-td>
          <oc-td width="shrink">
            <div class="uk-button-group">
              <oc-button
                v-oc-tooltip="$gettext('Restore older version')"
                appearance="raw"
                :aria-label="$gettext('Restore older version')"
                @click="revertVersion(item)"
              >
                <oc-icon name="restore" />
              </oc-button>
            </div>
          </oc-td>
          <oc-td width="shrink">
            <div class="uk-button-group">
              <oc-button
                v-oc-tooltip="$gettext('Download older version')"
                appearance="raw"
                :aria-label="$gettext('Download older version')"
                @click="downloadVersion(item)"
              >
                <oc-icon name="cloud_download" />
              </oc-button>
            </div>
          </oc-td>
        </oc-tr>
      </oc-tbody>
    </oc-table-simple>
    <div v-else>
      <span v-translate>No Versions available for this file</span>
    </div>
  </div>
</template>
<script>
import Mixins from '../../../mixins'
import MixinResources from '../../../mixins/resources'
import { mapActions, mapGetters } from 'vuex'

export default {
  mixins: [Mixins, MixinResources],
  title: $gettext => {
    return $gettext('Versions')
  },
  data: () => ({
    loading: false
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

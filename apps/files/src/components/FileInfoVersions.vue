<template>
  <div id="oc-file-versions-sidebar">
    <oc-loader v-if="loading" />
    <oc-table v-if="!loading && hasVersion" middle divider>
      <oc-table-group>
        <oc-table-row v-for="(item, index) in versions" :key="index" class="file-row">
          <oc-table-cell shrink>
            <oc-icon :name="fileTypeIcon(highlightedFile)" />
          </oc-table-cell>
          <oc-table-cell>
            <oc-table-cell class="uk-text-meta uk-text-nowrap">
              {{ formDateFromNow(item.fileInfo['{DAV:}getlastmodified']) }}
            </oc-table-cell>
            <oc-table-cell class="uk-text-meta uk-text-nowrap">
              {{ item.fileInfo['{DAV:}getcontentlength'] | fileSize }}
            </oc-table-cell>
          </oc-table-cell>
          <oc-table-cell shrink>
            <div class="uk-button-group uk-margin-small-right">
              <oc-button
                variation="raw"
                :aria-label="$gettext('Restore older version')"
                @click="revertVersion(item)"
              >
                <oc-icon name="restore" />
              </oc-button>
            </div>
          </oc-table-cell>
          <oc-table-cell shrink>
            <div class="uk-button-group uk-margin-small-right">
              <oc-button
                variation="raw"
                :aria-label="$gettext('Download older version')"
                @click="downloadVersion(item)"
              >
                <oc-icon name="cloud_download" />
              </oc-button>
            </div>
          </oc-table-cell>
        </oc-table-row>
      </oc-table-group>
    </oc-table>
    <div v-else>
      <span v-translate>No Versions available for this file</span>
    </div>
  </div></template
>
<script>
import Mixins from '../mixins.js'
import { mapGetters } from 'vuex'

export default {
  mixins: [Mixins],
  title: $gettext => {
    return $gettext('Versions')
  },
  data: () => ({
    versions: [],
    loading: false
  }),
  computed: {
    ...mapGetters('Files', ['highlightedFile']),
    ...mapGetters(['getToken']),
    hasVersion() {
      return this.versions.length > 0
    },
    currentFile() {
      return this.highlightedFile
    }
  },
  watch: {
    currentFile() {
      this.getFileVersions()
    }
  },
  mounted() {
    this.getFileVersions()
  },
  methods: {
    currentVersionId(file) {
      const etag = file.name.split('/')
      return etag[etag.length - 1]
    },
    getFileVersions() {
      this.loading = true
      this.$client.fileVersions
        .listVersions(this.currentFile.id)
        .then(res => {
          if (res) this.versions = res
        })
        .finally(_ => {
          this.loading = false
        })
    },
    revertVersion(file) {
      this.$client.fileVersions
        .restoreFileVersion(this.currentFile.id, this.currentVersionId(file), this.currentFile.path)
        .then(() => {
          this.getFileVersions()
        })
    },
    downloadVersion(file) {
      const version = this.currentVersionId(file)
      const url = this.$client.fileVersions.getFileVersionUrl(this.currentFile.id, version)

      const headers = new Headers()
      headers.append('Authorization', 'Bearer ' + this.getToken)
      headers.append('X-Requested-With', 'XMLHttpRequest')

      return this.downloadFileFromUrl(url, headers, file.name)
    }
  }
}
</script>

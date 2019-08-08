<template>
    <div id="oc-file-versions-sidebar">
      <oc-loader v-if="loading" />
        <oc-table middle divider v-if="!loading && hasVersion">
            <oc-table-group>
                <oc-table-row v-for="(item, index) in versions" :key="index" class="file-row">
                    <oc-table-cell>
                        <oc-table-cell class="uk-text-meta uk-text-nowrap">
                            {{ formDateFromNow(item.fileInfo['{DAV:}getlastmodified']) }}
                        </oc-table-cell>
                        <oc-table-cell class="uk-text-meta uk-text-nowrap">
                            {{  item.fileInfo['{DAV:}getcontentlength'] | fileSize }}
                        </oc-table-cell>
                    </oc-table-cell>
                    <oc-table-cell>
                        <div class="uk-button-group uk-margin-small-right">
                            <oc-button @click="revertVersion(item)" icon="restore"></oc-button>
                            <oc-button @click="downloadVersion(item)" icon="cloud_download"></oc-button>
                        </div>
                    </oc-table-cell>
                </oc-table-row>
            </oc-table-group>
        </oc-table>
        <div v-else>
          <span v-translate>No Versions available for this file</span>
        </div>
    </div></template>
<script>
import Mixins from '../mixins.js'
import { mapGetters } from 'vuex'

export default {
  mixins: [Mixins],
  title: ($gettext) => {
    return $gettext('Versions')
  },
  data: () => ({
    versions: [],
    loading: false
  }),
  mounted () {
    this.getFileVersions()
  },
  watch: {
    currentFile () {
      this.getFileVersions()
    }
  },
  computed: {
    ...mapGetters('Files', ['highlightedFile']),
    ...mapGetters(['getToken']),
    hasVersion () {
      return this.versions.length > 0
    },
    currentFile () {
      return this.highlightedFile
    }
  },
  methods: {
    currentVersionId (file) {
      const etag = file.name.split('/')
      return etag[etag.length - 1]
    },
    getFileVersions () {
      this.loading = true
      this.$client.fileVersions.listVersions(this.currentFile.id).then((res) => {
        if (res) this.versions = res
      }).finally(_ => {
        this.loading = false
      })
    },
    revertVersion (file) {
      this.$client.fileVersions.restoreFileVersion(this.currentFile.id, this.currentVersionId(file), this.currentFile.path).then(() => {
        this.getFileVersions()
      })
    },
    downloadVersion (file) {
      const version = this.currentVersionId(file)
      const url = this.$client.fileVersions.getFileVersionUrl(this.currentFile.id, version)

      const headers = new Headers()
      headers.append('Authorization', 'Bearer ' + this.getToken)
      return this.downloadFileFromUrl(url, headers, file.name)
    }
  }
}
</script>

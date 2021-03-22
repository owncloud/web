<template>
  <div>
    <oc-spinner
      v-if="loading"
      :aria-label="this.$gettext('Loading Onlyoffice')"
      class="uk-position-center"
      size="xlarge"
    />
    <iframe v-else id="onlyoffice-editor" ref="onlyOfficeEditor" :src="iframeSource" />
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import queryString from 'query-string'
import { DateTime } from 'luxon'

export default {
  name: 'OnlyOfficeEditor',
  data() {
    return {
      loading: true,
      filePath: '',
      fileExtension: '',
      isReadOnly: null,
      currentETag: null
    }
  },
  computed: {
    ...mapGetters(['configuration']),
    config() {
      const {
        url = `${this.configuration.server}apps/onlyoffice/`,
        theme = 'minimal',
        autosave = false
      } =
        this.$store.state.apps.fileEditors.find(editor => editor.app === 'onlyoffice').config || {}
      return { url, theme, autosave: autosave ? 1 : 0 }
    },
    iframeSource() {
      const query = queryString.stringify({
        filePath: encodeURIComponent(this.filePath)
      })

      return `${this.config.url}/${this.fileId}?${query}`
    }
  },
  created() {
    this.filePath = this.$route.params.filePath
    this.fileId = this.$route.params.fileId
    this.fileExtension = this.filePath.split('.').pop()
    this.checkPermissions()
    window.addEventListener('message', event => {
      if (event.data.length > 0) {
        var payload = JSON.parse(event.data)
        switch (payload.event) {
          case 'init':
            this.fileExtension === 'vsdx' ? this.importVisio() : this.load()
            break
          case 'autosave':
          case 'save':
            this.save(payload)
            break
          case 'exit':
            this.exit()
            break
        }
      }
    })
  },
  methods: {
    ...mapActions(['showMessage']),
    error(error) {
      this.showMessage({
        title: this.$gettext('The document could not be loaded…'),
        desc: error,
        status: 'danger',
        autoClose: {
          enabled: true
        }
      })
    },
    checkPermissions() {
      this.$client.files
        .fileInfo(this.filePath, ['{http://owncloud.org/ns}permissions'])
        .then(v => {
          this.isReadOnly = v.fileInfo['{http://owncloud.org/ns}permissions'].indexOf('W') === -1
          this.loading = false
        })
        .catch(error => {
          this.error(error)
        })
    },
    load() {
      this.$client.files
        .getFileContents(this.filePath, { resolveWithResponseObject: true })
        .then(resp => {
          this.currentETag = resp.headers.ETag
        })
        .catch(error => {
          this.error(error)
        })
    },
    exit() {
      window.close()
    },
    getTimestamp() {
      return DateTime.local().toFormat('YYYYMMDD[T]HHmmss')
    }
  }
}
</script>
<style scoped>
#onlyoffice-editor {
  margin-top: -45px; /* hide OC10 top banner */
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  border: none;
  padding: 0;
  overflow: hidden;
}
</style>

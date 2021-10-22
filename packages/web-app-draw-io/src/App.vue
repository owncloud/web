<template>
  <main>
    <oc-spinner
      v-if="loading"
      :aria-label="$gettext('Loading media')"
      class="uk-position-center"
      size="xlarge"
    />
    <iframe
      v-else
      id="drawio-editor"
      ref="drawIoEditor"
      :src="iframeSource"
      :title="$gettext('Draw.io editor')"
    />
  </main>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import { basename } from 'path'
import queryString from 'query-string'
import { DateTime } from 'luxon'
import { DavPermission, DavProperty } from 'web-pkg/src/constants'

export default {
  name: 'DrawIoEditor',
  data: () => ({
    loading: true,
    filePath: '',
    fileExtension: '',
    isReadOnly: null,
    currentETag: null
  }),
  computed: {
    ...mapGetters(['getToken']),
    config() {
      const {
        url = 'https://embed.diagrams.net',
        theme = 'minimal',
        autosave = false
      } = this.$store.state.apps.fileEditors.find((editor) => editor.app === 'draw-io').config || {}
      return { url, theme, autosave: autosave ? 1 : 0 }
    },
    iframeSource() {
      const query = queryString.stringify({
        embed: 1,
        chrome: this.isReadOnly ? 0 : 1,
        picker: 0,
        stealth: 1,
        spin: 1,
        proto: 'json',
        ui: this.config.theme
      })

      return `${this.config.url}?${query}`
    }
  },
  created() {
    this.filePath = `/${this.$route.params.filePath.split('/').filter(Boolean).join('/')}`
    this.fileExtension = this.filePath.split('.').pop()
    this.checkPermissions()
    window.addEventListener('message', (event) => {
      if (event.data.length > 0) {
        const payload = JSON.parse(event.data)
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
        title: this.$gettext('The diagram could not be loaded…'),
        desc: error,
        status: 'danger'
      })
    },
    checkPermissions() {
      this.$client.files
        .fileInfo(this.filePath, [DavProperty.Permissions])
        .then((v) => {
          this.isReadOnly =
            v.fileInfo[DavProperty.Permissions].indexOf(DavPermission.Updateable) === -1
          this.loading = false
        })
        .catch((error) => {
          this.error(error)
        })
    },
    load() {
      this.$client.files
        .getFileContents(this.filePath, { resolveWithResponseObject: true })
        .then((resp) => {
          this.currentETag = resp.headers.ETag
          this.$refs.drawIoEditor.contentWindow.postMessage(
            JSON.stringify({
              action: 'load',
              xml: resp.body,
              autosave: this.config.autosave
            }),
            '*'
          )
        })
        .catch((error) => {
          this.error(error)
        })
    },
    importVisio() {
      const url = this.$client.files.getFileUrl(this.filePath)
      const headers = new Headers({
        Authorization: 'Bearer ' + this.getToken,
        'X-Requested-With': 'XMLHttpRequest'
      })
      const getDescription = () =>
        this.$gettextInterpolate(
          'The diagram will open as a new .drawio file: %{file}',
          { file: basename(this.filePath) },
          true
        )
      // Change the working file after the import so the original file is not overwritten
      this.filePath += `_${this.getTimestamp()}.drawio`
      this.showMessage({
        title: this.$gettext('Diagram imported'),
        desc: getDescription()
      })
      fetch(url, { headers })
        .then((resp) => {
          // Not setting `currentETag` on imports allows to create new files
          // otherwise the ETag comparison fails with a 412 during the autosave/save event
          // this.currentETag = resp.headers.get('etag')
          return resp.arrayBuffer()
        })
        .then((arrayBuffer) => {
          const blob = new Blob([arrayBuffer], { type: 'application/vnd.visio' })
          const reader = new FileReader()
          reader.onloadend = () => {
            this.$refs.drawIoEditor.contentWindow.postMessage(
              JSON.stringify({
                action: 'load',
                xml: reader.result,
                autosave: this.config.autosave
              }),
              '*'
            )
          }
          reader.readAsDataURL(blob)
        })
        .catch((error) => {
          this.error(error)
        })
    },
    save(payload) {
      this.$client.files
        .putFileContents(this.filePath, payload.xml, {
          previousEntityTag: this.currentETag
        })
        .then((resp) => {
          this.currentETag = resp.ETag
          this.$refs.drawIoEditor.contentWindow.postMessage(
            JSON.stringify({
              action: 'status',
              modified: false
            }),
            '*'
          )
        })
        .catch((error) => {
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
#drawio-editor {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  border: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>

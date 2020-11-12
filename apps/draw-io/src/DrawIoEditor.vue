<template>
  <iframe id="drawio-editor" ref="drawIoEditor" :src="iframeSource"></iframe>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import queryString from 'query-string'

export default {
  name: 'DrawIoEditor',
  data: () => ({
    filePath: '',
    currentETag: null
  }),
  computed: {
    ...mapGetters(['getToken']),
    loading() {
      return this.content === ''
    },
    iframeSource() {
      const query = queryString.stringify({
        embed: 1,
        picker: 0,
        stealth: 1,
        spin: 1,
        proto: 'json',
        ui: 'minimal'
      })

      return `https://embed.diagrams.net?${query}`
    }
  },
  created() {
    this.filePath = this.$route.params.filePath
    this.extension = this.filePath.split('.').pop()

    window.addEventListener('message', event => {
      if (event.data.length > 0) {
        var payload = JSON.parse(event.data)
        switch (payload.event) {
          case 'init':
            this.extension === 'vsdx' ? this.importVisio() : this.load()
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
        status: 'danger',
        autoClose: {
          enabled: true
        }
      })
    },

    load() {
      this.$client.files
        .getFileContents(this.filePath, { resolveWithResponseObject: true })
        .then(resp => {
          this.currentETag = resp.headers.ETag
          this.$refs.drawIoEditor.contentWindow.postMessage(
            JSON.stringify({
              action: 'load',
              xml: resp.body,
              autosave: 1
            }),
            '*'
          )
        })
        .catch(error => {
          this.error(error)
        })
    },
    importVisio() {
      const url = this.$client.files.getFileUrl(this.filePath)
      const headers = new Headers({
        Authorization: 'Bearer ' + this.getToken,
        'X-Requested-With': 'XMLHttpRequest'
      })
      // Change the working file after the import
      this.filePath += '.drawio'
      fetch(url, { headers })
        .then(resp => {
          // Not setting `currentETag` on imports allows to create new files
          // otherwise the ETag comparison fails with a 412 during the autosave/save event
          // this.currentETag = resp.headers.get('etag')
          return resp.arrayBuffer()
        })
        .then(arrayBuffer => {
          var blob = new Blob([arrayBuffer], { type: 'application/vnd.visio' })
          var reader = new FileReader()
          reader.onloadend = () => {
            this.$refs.drawIoEditor.contentWindow.postMessage(
              JSON.stringify({
                action: 'load',
                xml: reader.result,
                autosave: 1
              }),
              '*'
            )
          }
          reader.readAsDataURL(blob)
        })
        .catch(error => {
          this.error(error)
        })
    },
    save(payload) {
      this.$client.files
        .putFileContents(this.filePath, payload.xml, {
          previousEntityTag: this.currentETag
        })
        .then(resp => {
          this.currentETag = resp.ETag
          this.$refs.drawIoEditor.contentWindow.postMessage(
            JSON.stringify({
              action: 'status',
              modified: false
            }),
            '*'
          )
        })
        .catch(error => {
          this.error(error)
        })
    },
    exit() {
      window.close()
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
  z-index: 999999;
}
</style>

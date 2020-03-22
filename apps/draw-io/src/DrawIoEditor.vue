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

      return 'https://www.draw.io?' + query
    }
  },
  created() {
    this.filePath = this.$route.params.filePath

    window.addEventListener('message', event => {
      console.log(event)
      if (event.data.length > 0) {
        var payload = JSON.parse(event.data)
        if (payload.event === 'init') {
          this.load()
        } else if (payload.event === 'save') {
          this.save(payload)
        } else if (payload.event === 'exit') {
          this.exit()
        }
      }
    })
  },
  methods: {
    ...mapActions(['showMessage']),
    error(error) {
      this.showMessage({
        title: this.$gettext('PDF could not be loaded…'),
        desc: error,
        status: 'danger'
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
              xml: resp.body
            }),
            '*'
          )
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

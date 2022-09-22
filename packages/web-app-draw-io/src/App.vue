<template>
  <main>
    <div v-if="loading" class="oc-position-center">
      <oc-spinner size="xlarge" />
      <p v-translate class="oc-invisible">Loading media</p>
    </div>
    <iframe
      v-else
      id="drawio-editor"
      ref="drawIoEditor"
      :src="iframeSource"
      :title="$gettext('Draw.io editor')"
    />
  </main>
</template>
<script lang="ts">
import { mapActions } from 'vuex'
import qs from 'qs'
import { DateTime } from 'luxon'
import { DavPermission, DavProperty } from 'web-pkg/src/constants'
import {
  useAppDefaults,
  useCapabilityCoreSupportUrlSigning,
  useClientService
} from 'web-pkg/src/composables'
import { defineComponent, unref } from '@vue/composition-api'
import { basename } from 'path'

export default defineComponent({
  name: 'DrawIoEditor',
  setup() {
    return {
      ...useAppDefaults({
        applicationId: 'draw-io'
      })
    }
  },
  data: () => ({
    loading: true,
    filePath: '',
    fileExtension: '',
    isReadOnly: null,
    currentETag: null
  }),
  computed: {
    config() {
      const {
        url = 'https://embed.diagrams.net',
        theme = 'minimal',
        autosave = false
      } = this.applicationConfig
      return { url, theme, autosave: autosave ? 1 : 0 }
    },
    iframeSource() {
      const query = qs.stringify({
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
    this.filePath = this.currentFileContext.path
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
            this.save(payload, true)
            break
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
    errorPopup(error) {
      this.showMessage({
        title: this.$gettext('An error occurred'),
        desc: error,
        status: 'danger'
      })
    },
    successPopup(msg) {
      this.showMessage({
        title: this.$gettext('The diagram was successfully saved'),
        desc: msg,
        status: 'success'
      })
    },
    errorNotification(error) {
      this.$refs.drawIoEditor.contentWindow.postMessage(
        JSON.stringify({
          action: 'status',
          message: error,
          modified: false
        }),
        '*'
      )
    },
    checkPermissions() {
      this.getFileInfo(this.filePath, [DavProperty.Permissions])
        .then((v) => {
          this.isReadOnly =
            v.fileInfo[DavProperty.Permissions].indexOf(DavPermission.Updateable) === -1
          this.loading = false
        })
        .catch((error) => {
          this.errorPopup(error)
        })
    },
    load() {
      this.getFileContents(this.currentFileContext)
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
          this.errorPopup(error)
        })
    },
    async importVisio() {
      const getDescription = () =>
        this.$gettextInterpolate(
          this.$gettext('The diagram will open as a new .drawio file: %{file}'),
          { file: basename(this.filePath) },
          true
        )
      // Change the working file after the import so the original file is not overwritten
      this.filePath += `_${this.getTimestamp()}.drawio`
      this.showMessage({
        title: this.$gettext('Diagram imported'),
        desc: getDescription()
      })
      this.getFileContents(this.currentFileContext, {
        responseType: 'arrayBuffer'
      })
      .then((resp) => {
          // Not setting `currentETag` on imports allows to create new files
          // otherwise the ETag comparison fails with a 412 during the autosave/save event
          // this.currentETag = resp.headers.get('etag')
          return resp.body
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
          this.errorPopup(error)
        })
    },
    save(payload, auto = false) {
      this.putFileContents(this.currentFileContext, {
        content: payload.xml,
        previousEntityTag: this.currentETag
      })
        .then((resp) => {
          this.currentETag = resp.ETag

          const message = this.$gettext('File saved!')
          if (auto) {
            this.$refs.drawIoEditor.contentWindow.postMessage(
              JSON.stringify({
                action: 'status',
                message: message,
                modified: false
              }),
              '*'
            )
          } else {
            this.successPopup(message)
          }
        })
        .catch((error) => {
          const errorFunc = auto ? this.errorNotification : this.errorPopup
          switch (error.statusCode) {
            case 412:
              errorFunc(
                this.$gettext(
                  'This file was updated outside this window. Please refresh the page. All changes will be lost, so download a copy first.'
                )
              )
              break
            case 500:
              errorFunc(this.$gettext("Couldn't save. Error when contacting the server"))
              break
            case 401:
              errorFunc(this.$gettext("Saving error. You're not authorized to save this file"))
              break
            default:
              errorFunc(error.message || error)
          }
        })
    },
    exit() {
      window.close()
    },
    getTimestamp() {
      return DateTime.local().toFormat('YYYYMMDD[T]HHmmss')
    }
  }
})
</script>
<style scoped>
#drawio-editor {
  width: 100%;
  height: 100%;
  border: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>

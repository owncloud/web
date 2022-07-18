import { mapGetters, mapActions } from 'vuex'

import { encodePath } from 'web-pkg/src/utils'

export default {
  install(Vue) {
    Vue.mixin({
      computed: {
        ...mapGetters(['capabilities']),

        isUrlSigningEnabled() {
          return this.capabilities.core && this.capabilities.core['support-url-signing']
        }
      },
      methods: {
        ...mapActions(['showMessage']),

        async downloadFile(file, version = null) {
          const isPublicLinkContext = this.$store.getters['runtime/auth/isPublicLinkContextReady']
          const isUserContext = this.$store.getters['runtime/auth/isUserContextReady']

          // construct the url and headers
          let url = null
          let headers = {}
          if (isPublicLinkContext) {
            url = file.downloadURL
          } else {
            if (version === null) {
              url = `${this.$client.helpers._davPath}${file.webDavPath}`
            } else {
              url = this.$client.fileVersions.getFileVersionUrl(file.id, version)
            }
            const accessToken = this.$store.getters['runtime/auth/accessToken']
            headers = { Authorization: 'Bearer ' + accessToken }
          }

          // download with signing enabled
          if (isUserContext && this.isUrlSigningEnabled) {
            try {
              const response = await fetch(url, {
                method: 'HEAD',
                headers
              })
              if (response.status === 200) {
                const signedUrl = await this.$client.signUrl(url)
                this.triggerDownload(signedUrl, file.name)
                return
              }
            } catch (e) {
              console.error(e)
            }
            this.showMessage({
              title: this.$gettext('Download failed'),
              desc: this.$gettext('File could not be located'),
              status: 'danger',
              autoClose: {
                enabled: true
              }
            })
            return
          } else {
            url = url + (url.includes('?') ? '&' : '?') + 'access_token=' + this.$store.getters['runtime/auth/accessToken']
          }

          this.triggerDownload(url, file.name)
        },
        encodePath,
        triggerDownload(url, name) {
          const a = document.createElement('a')
          a.style.display = 'none'
          document.body.appendChild(a)
          a.href = url
          // use download attribute to set desired file name
          a.setAttribute('download', name)
          // trigger the download by simulating click
          a.click()
          // cleanup
          document.body.removeChild(a)
        }
      }
    })
  }
}

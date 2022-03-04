<template>
  <main>
    <loading-screen v-if="loading" />
    <error-screen v-else-if="loadingError" />
    <object
      v-else
      class="pdf-viewer oc-width-1-1 oc-height-1-1"
      :data="blobUrl"
      type="application/pdf"
    />
  </main>
</template>
<script>
import { mapGetters } from 'vuex'
import { useAppDefaults } from 'web-pkg/src/composables'
import { DavProperties } from 'web-pkg/src/constants'
import { buildResource } from '../../web-app-files/src/helpers/resources'
import HTTPError from 'owncloud-sdk'
import ErrorScreen from './components/ErrorScreen.vue'
import LoadingScreen from './components/LoadingScreen.vue'

export default {
  name: 'PDFViewer',
  components: {
    ErrorScreen,
    LoadingScreen
  },
  setup() {
    return {
      ...useAppDefaults({
        applicationName: 'pdf-viewer'
      })
    }
  },
  data: () => ({
    loading: true,
    loadingError: false,
    filePath: '',
    blobUrl: ''
  }),
  computed: {
    ...mapGetters(['getToken'])
  },
  async created() {
    this.filePath = this.currentFileContext.path

    try {
      let resource = await this.getFileInfo(
        this.filePath,
        this.isPublicLinkContext ? DavProperties.PublicLink : DavProperties.Default
      )
      resource = buildResource(resource)

      let url
      const headers = new Headers()
      if (this.isPublicLinkContext) {
        url = resource.downloadURL
      } else {
        url = `${this.$client.helpers._davPath}${resource.webDavPath}`
        headers.append('Authorization', 'Bearer ' + this.getToken)
        headers.append('X-Requested-With', 'XMLHttpRequest')
      }

      const response = await fetch(url, {
        method: 'GET',
        headers
      })

      if (response.status !== 200) {
        throw new HTTPError(response.status, response.message)
      }

      const newBlob = new Blob([await response.blob()], { type: 'application/pdf' })
      this.blobUrl = URL.createObjectURL(newBlob)
      this.loading = false
    } catch (e) {
      this.loading = false
      this.loadingError = true
      console.error('Error fetching pdf', e.statusCode, e)
    }

    // TODO free memory when leaving
  }
}
</script>
<style scoped>
.pdf-viewer {
  border: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>

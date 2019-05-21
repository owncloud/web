<template lang="html">
  <div>
    <pdf-viewer-topbar />
    <oc-progress v-if="loading" :max="100" indeterminate></oc-progress>
    <pdf v-if="!loading" :page="currentPage" @error="error" @num-pages="loadPages" :src="content"></pdf>
  </div>
</template>
<script>
import pdf from 'vue-pdf'
import { mapGetters, mapActions } from 'vuex'
import PdfViewerTopbar from './components/PdfViewerTopbar.vue'

export default {
  name: 'PdfViewer',
  mounted () {
    if (this.activeFile.path === '') {
      this.closeApp()
      return
    }

    this.changePage(1)

    const url = this.$client.files.getFileUrl(this.activeFile.path)

    let headers = new Headers()
    headers.append('Authorization', 'Bearer ' + this.getToken)

    fetch(url, { headers })
      .then(response => {
        return response.blob()
      })
      .then(blob => {
        this.content = window.URL.createObjectURL(blob)
      })
  },
  components: {
    pdf,
    PdfViewerTopbar
  },
  data: () => ({
    content: '',
    numPages: 0,
    page: 1
  }),
  computed: {
    ...mapGetters(['getToken', 'activeFile']),
    ...mapGetters('PDFViewer', ['currentPage']),
    loading () {
      return this.content === ''
    }
  },
  methods: {
    ...mapActions('PDFViewer', ['loadPages', 'changePage']),
    ...mapActions(['showNotification']),
    closeApp () {
      this.$router.push({
        path: '/files'
      })
    },
    error (error) {
      this.showNotification({
        title: this.$gettext('PDF could not be loaded…'),
        desc: error,
        status: 'danger'
      })
    }
  }
}
</script>

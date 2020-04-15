<template lang="html">
  <div id="pdf-viewer">
    <pdf-viewer-app-bar />
    <oc-progress v-if="loading" :max="100" indeterminate></oc-progress>
    <pdf
      v-if="!loading"
      :page="currentPage"
      :src="content"
      @error="error"
      @num-pages="loadPages"
    ></pdf>
  </div>
</template>
<script>
import pdf from 'vue-pdf'
import PdfViewerAppBar from './PdfViewerAppBar.vue'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'PdfViewer',
  components: {
    pdf,
    PdfViewerAppBar
  },
  data: () => ({
    content: '',
    numPages: 0,
    page: 1
  }),
  computed: {
    ...mapGetters(['getToken', 'activeFile']),
    ...mapGetters('PDFViewer', ['currentPage']),
    loading() {
      return this.content === ''
    }
  },
  mounted() {
    if (this.activeFile.path === '') {
      this.closeApp()
      return
    }

    this.changePage(1)

    const url = this.$client.files.getFileUrl(this.activeFile.path)

    const headers = new Headers()
    headers.append('Authorization', 'Bearer ' + this.getToken)
    headers.append('X-Requested-With', 'XMLHttpRequest')

    fetch(url, { headers })
      .then(response => {
        return response.blob()
      })
      .then(blob => {
        this.content = window.URL.createObjectURL(blob)
      })
  },
  methods: {
    ...mapActions('PDFViewer', ['loadPages', 'changePage']),
    ...mapActions(['showMessage']),
    closeApp() {
      this.$router.push({
        path: '/files'
      })
    },
    error(error) {
      this.showMessage({
        title: this.$gettext('PDF could not be loaded…'),
        desc: error,
        status: 'danger'
      })
    }
  }
}
</script>

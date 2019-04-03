<template lang="html">
  <div>
    <oc-progress v-if="loading" :max="100" indeterminate></oc-progress>
    <pdf v-if="!loading" :page="currentPage" @error="error" @num-pages="loadPages" :src="content"></pdf>
  </div>
</template>
<script>
import pdf from 'vue-pdf'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'PdfViewer',
  mounted () {
    if (this.activeFile.path === '') {
      this.closeApp()
      return
    }
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
    pdf
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
    ...mapActions('PDFViewer', ['loadPages']),
    ...mapActions(['showNotification']),
    closeApp () {
      this.$router.push({
        path: '/files/list/home'
      })
    },
    error (error) {
      this.showNotification({
        title: this.$gettext('PDF could not be loaded ....'),
        desc: error,
        type: 'error'
      })
    }
  }
}
</script>

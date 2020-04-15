<template>
  <div id="pdf-viewer-app-bar" class="oc-app-bar">
    <oc-grid flex gutter="small">
      <div class="uk-width-expand">
        <oc-icon name="application-pdf" /> {{ activeFile.path.substr(1) }}
      </div>
      <div v-if="!loading" class="uk-width-auto">
        <oc-text-input v-model.number="page" type="number" :min="1" :max="pageCount" />&nbsp;/{{
          pageCount
        }}
      </div>
      <div class="uk-width-auto">
        <oc-button icon="close" @click="closeApp"></oc-button>
      </div>
    </oc-grid>
  </div>
</template>
<script>
// TODO put active Page and max Pages into store
import { mapGetters, mapActions } from 'vuex'
export default {
  data: () => ({}),
  computed: {
    ...mapGetters(['activeFile']),
    ...mapGetters('PDFViewer', ['pageCount', 'currentPage']),
    page: {
      get() {
        return this.currentPage
      },
      set(val) {
        this.changePage(val)
      }
    },
    loading() {
      return this.content === ''
    }
  },
  methods: {
    ...mapActions('PDFViewer', ['changePage']),
    closeApp() {
      this.$router.push({
        path: '/files/list'
      })
    }
  }
}
</script>

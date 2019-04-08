<template>
  <oc-topbar variation="secondary">
    <oc-topbar-item slot="left">
      <oc-icon name="application-pdf"></oc-icon>
    </oc-topbar-item>
    <template slot="title">
      <oc-topbar-item>{{ activeFile.path.substr(1) }}</oc-topbar-item>
    </template>
    <oc-topbar-item slot="right">
      <oc-topbar-item v-if="!loading">
        <oc-text-input v-model.number="page" type="number" :min="1" :max="pageCount" />&nbsp;/{{ pageCount }}
      </oc-topbar-item>
      <oc-button icon="close" @click="closeApp"></oc-button>
    </oc-topbar-item>
  </oc-topbar>
</template>
<script>
// TODO put active Page and max Pages into store
import { mapGetters, mapActions } from 'vuex'
export default {
  data: () => ({
  }),
  computed: {
    ...mapGetters(['activeFile']),
    ...mapGetters('PDFViewer', ['pageCount', 'currentPage']),
    page: {
      get () {
        return this.currentPage
      },
      set (val) {
        this.changePage(val)
      }
    },
    loading () {
      return this.content === ''
    }
  },
  methods: {
    ...mapActions('PDFViewer', ['changePage']),
    closeApp () {
      this.$router.push({
        path: '/files/list/home'
      })
    }
  }
}
</script>

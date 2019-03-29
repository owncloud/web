<template>
  <oc-top-bar>
    <template slot="left">
      <oc-icon name="application-pdf"></oc-icon>
    </template>
    <template slot="title">
      <span style="line-height: 65px;">{{ activeFile.path.substr(1) }}</span>
    </template>
    <template slot="action_pages">
      <div v-if="!loading">
        <oc-input v-model="page" type="number" /> /{{ pageCount }}
      </div>
    </template>
    <template slot="action_close">
      <oc-button icon="close" @click="closeApp"></oc-button>
    </template>
  </oc-top-bar>
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

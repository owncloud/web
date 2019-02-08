<template>
  <oc-app-top-bar>
    <template slot="left">
      <v-icon class="pa-3">ocft icon-application-pdf</v-icon>
    </template>
    <template slot="title">
      <span style="line-height: 65px;">{{ activeFile.path.substr(1) }}</span>
    </template>
    <template slot="action_pages">
      <div class="mt-3" v-if="!loading">
        <input v-model.number="page" :max="pageCount" min="1" type="number" style="width: 5em"> /{{ pageCount }}
      </div>
    </template>
    <template slot="action_close">
      <v-btn class="pa-2" icon @click="closeApp">
        <v-icon>close</v-icon>
      </v-btn>
    </template>
  </oc-app-top-bar>
</template>
<script>
// TODO put active Page and max Pages into store
import OcAppTopBar from 'oc_components/OcAppTopBar.vue'
import { mapGetters, mapActions } from 'vuex'
export default {
  components: {
    OcAppTopBar
  },
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

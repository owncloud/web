<template>
  <main>
    <app-top-bar :resource="resource" @close="closeApp" />
    <loading-screen v-if="loading" />
    <error-screen v-else-if="loadingError" />
    <div v-else class="oc-height-1-1">
      <object class="epub-viewer oc-width-1-1" :data="url" type="application/epub" />
    </div>
  </main>
</template>
<script lang="ts">
import { useAppDefaults } from 'web-pkg/src/composables'
import AppTopBar from 'web-pkg/src/components/AppTopBar.vue'
import ErrorScreen from './components/ErrorScreen.vue'
import LoadingScreen from './components/LoadingScreen.vue'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'EPUBViewer',
  components: {
    ErrorScreen,
    LoadingScreen,
    AppTopBar
  },
  setup() {
    return {
      ...useAppDefaults({
        applicationId: 'epub-viewer'
      })
    }
  },
  data: () => ({
    loading: true,
    loadingError: false,
    url: '',
    resource: null
  }),
  watch: {
    currentFileContext: {
      handler: function () {
        this.unloadEpub()
        this.loadEpub(this.currentFileContext)
      },
      immediate: true
    }
  },
  beforeDestroy() {
    this.unloadEpub()
  },
  methods: {
    async loadEpub(fileContext) {
      try {
        this.loading = true
        this.resource = await this.getFileInfo(fileContext)
        this.replaceInvalidFileRoute(this.currentFileContext, this.resource)
        this.url = await this.getUrlForResource(fileContext.space, this.resource, {
          disposition: 'inline'
        })
      } catch (e) {
        this.loadingError = true
        console.error('Error fetching epub', e)
      } finally {
        this.loading = false
      }
    },
    unloadEpub() {
      this.revokeUrl(this.url)
    }
  }
})
</script>
<style scoped>
.epub-viewer {
  border: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
  height: calc(100% - 52px);
}
</style>

<template>
  <div id="oc-file-sidebar-web-component">
    <oc-loader v-if="loading" />
    <div v-if="!loading">
      <!-- TODO: define all props which need to be passed into a web component -->
      <component :is="componentName" :selected-file="highlightedFileAsJson"></component>
    </div>
  </div>
</template>
<script>
import Mixins from '../mixins.js'
import { mapGetters } from 'vuex'

export default {
  mixins: [Mixins],
  title: $gettext => {
    return null
  },
  props: {
    componentName: {
      type: String,
      required: true
    },
    componentUrl: {
      type: String,
      required: true
    }
  },
  data: () => ({
    loading: true
  }),
  computed: {
    ...mapGetters('Files', ['highlightedFile']),
    ...mapGetters(['getToken']),
    highlightedFileAsJson() {
      return JSON.stringify(this.highlightedFile)
    }
  },
  mounted() {
    // tell Vue to not take care of the web component
    window.Vue.config.ignoredElements = [this.componentName]

    // load component async
    requirejs(
      [this.componentUrl],
      app => {
        this.loading = false
      },
      error => {
        console.log(error)
      }
    )
  },
  methods: {}
}
</script>

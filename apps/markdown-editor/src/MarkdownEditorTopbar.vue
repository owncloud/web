<template>
  <oc-topbar variation="secondary" uk-sticky="offset: 60">
    <oc-topbar-item slot="left">
      <oc-button icon="save" @click="saveContent" :disabled="!isTouched"></oc-button>
      <oc-spinner v-if="isLoading"></oc-spinner>
    </oc-topbar-item>
    <oc-topbar-item slot="title">
      <span>{{ activeFile.path.substr(1) }}</span>
    </oc-topbar-item>
    <oc-topbar-item slot="right">
      <oc-button icon="close" @click="closeApp"></oc-button>
    </oc-topbar-item>
  </oc-topbar>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapGetters(['activeFile']),
    ...mapGetters('MarkdownEditor', ['isTouched', 'isLoading'])
  },
  methods: {
    ...mapActions('MarkdownEditor', ['saveFile']),
    saveContent () {
      this.saveFile({
        client: this.$client
      })
    },
    closeApp () {
      this.$router.push({
        path: '/files'
      })
    }
  }
}
</script>

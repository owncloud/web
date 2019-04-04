<template>
  <oc-topbar variation="secondary">
    <oc-topbar-item slot="left">
      <oc-button icon="save" @click="saveContent(currentContent)" :disabled="!isTouched"></oc-button>
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
    ...mapGetters('MarkdownEditor', ['isTouched', 'currentContent'])
  },
  methods: {
    ...mapActions('MarkdownEditor', ['touched']),
    saveContent (content) {
      this.$client.files.putFileContents(this.activeFile.path, content).then(() => { this.touched(false) })
    },
    closeApp () {
      this.$router.push({
        path: '/files/list/home'
      })
    }
  }
}
</script>

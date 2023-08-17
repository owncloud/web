<template>
  <object class="pdf-viewer oc-width-1-1 oc-height-1-1" :data="url" type="application/pdf" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    url: {
      type: String,
      required: true
    }
  },
  created() {
    console.log('pdf viewer "created" hook called')
    console.log('pdf url: ' + this.url + ' / ' + typeof this.url)
    console.log('pdf data: ' + this.$data + ' / ' + typeof this.url)
    console.log('url length: ' + (this.url as String).length)
  },
  mounted() {
    console.log('pdf viewer "mounted" hook called')
    console.log('pdf url: ' + this.url + ' / ' + typeof this.url)
    console.log('pdf data: ' + this.$data + ' / ' + typeof this.url)
    console.log('url length: ' + (this.url as String).length)
  },
  beforeUpdate() {
    console.log('pdf viewer "before update" hook called')
    console.log('pdf url: ' + this.url + ' / ' + typeof this.url)
    console.log('pdf data: ' + this.$data + ' / ' + typeof this.url)
    console.log('url length: ' + (this.url as String).length)
  }
})
</script>

<style scoped>
.pdf-viewer {
  border: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>

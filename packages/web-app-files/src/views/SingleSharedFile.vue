<template>
  <div class="file-without-app">
    <file-info :displayed-item="file" />
    <file-details :displayed-item="file" :class="'oc-mb'" />
    <file-actions />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

import FileDetails from '../components/SideBar/Details/FileDetails.vue'
import FileActions from '../components/SideBar/Actions/FileActions.vue'
import FileInfo from '../components/SideBar/FileInfo.vue'

export default defineComponent({
  components: {
    FileDetails,
    FileActions,
    FileInfo
  },
  props: {
    file: {
      type: Object,
      default: null
    }
  }
})
</script>

<style lang="scss" scoped>
.file-without-app {
  width: 50%;
  margin: 0 auto;
}
</style>

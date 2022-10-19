<template>
  <div class="file-without-app">
    <file-info />
    <file-details :class="'oc-mb'" />
    <file-actions />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { SpaceResource } from 'web-client/src/helpers'
import { mapGetters } from 'vuex'

import FileDetails from '../../components/SideBar/Details/FileDetails.vue'
import FileActions from '../../components/SideBar/Actions/FileActions.vue'
import FileInfo from '../../components/SideBar/FileInfo.vue'

export default defineComponent({
  components: {
    FileDetails,
    FileActions,
    FileInfo
  },
  provide() {
    return {
      // File info and details require this
      resource: computed(() => this.highlightedFile),
      // File actions require this
      space: computed(() => this.space)
    }
  },
  props: {
    space: {
      type: Object as PropType<SpaceResource>,
      required: false,
      default: null
    }
  },
  computed: {
    ...mapGetters('Files', ['highlightedFile'])
  }
})
</script>

<style lang="scss" scoped>
.file-without-app {
  width: 50%;
  margin: 0 auto;
}
</style>

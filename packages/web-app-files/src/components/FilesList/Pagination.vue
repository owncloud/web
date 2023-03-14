<template>
  <oc-pagination
    v-if="pages > 1"
    :pages="pages"
    :current-page="currentPage"
    :max-displayed="3"
    :current-route="route"
    class="files-pagination oc-flex oc-flex-center oc-my-s"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRoute } from 'web-pkg/src/composables'

export default defineComponent({
  props: {
    pages: {
      type: Number,
      required: true
    },
    currentPage: {
      type: Number,
      required: true
    }
  },
  setup() {
    const route = useRoute()
    return {
      route
    }
  },
  watch: {
    currentPage: {
      handler: function () {
        document.getElementsByClassName('files-view-wrapper')[0]?.scrollTo(0, 0)
      }
    }
  }
})
</script>

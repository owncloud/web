<template>
  <oc-button
    type="a"
    justify-content="left"
    class="files-search-preview oc-flex oc-width-1-1"
    appearance="raw"
    target="_blank"
    :href="repository.html_url"
  >
    {{ repository.name }}
  </oc-button>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue'
import { Repository } from './client'

export default defineComponent({
  props: {
    searchResult: {
      type: Object as PropType<Repository>,
      default: function () {
        return {}
      }
    }
  },
  setup(props) {
    return {
      repository: props.searchResult
    }
  }
})
</script>

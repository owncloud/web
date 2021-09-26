<template>
  <div class="files-search-preview">
    {{ resource.title }}
  </div>
</template>

<script>
export default {
  props: {
    searchResult: {
      type: Object,
      default: function() {
        return {}
      }
    },
    provider: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  data() {
    return {
      resource: undefined
    }
  },
  beforeMount() {
    this.resource = this.searchResult.data
  }
}
</script>

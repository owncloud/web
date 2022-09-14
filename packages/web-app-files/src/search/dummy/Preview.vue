<template>
  <span>{{ resource }}</span>
</template>

<script lang="ts">
export default {
  props: {
    searchResult: {
      type: Object,
      default: function () {
        return {}
      }
    },
    provider: {
      type: Object,
      default: function () {
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

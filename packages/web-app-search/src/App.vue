<template>
  <main id="search" class="oc-flex oc-height-1-1">
    <router-view id="search-view" />
  </main>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Search'
})
</script>

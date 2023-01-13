<template>
  <div class="oc-text-center">
    <oc-spinner size="xlarge" />
    <p v-translate class="oc-invisible">Loading app</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'LoadingScreen'
})
</script>

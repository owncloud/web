<template>
  <tbody>
    <slot />
  </tbody>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'OcTbody',
  status: 'ready',
  release: '2.1.0'
})
</script>

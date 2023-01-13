<template>
  <tfoot>
    <slot />
  </tfoot>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'OcTfoot',
  status: 'ready',
  release: '2.1.0'
})
</script>

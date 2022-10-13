<template>
  <div>
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: 'PlainLayout'
})
</script>

<template>
  <h4 class="oc-text-truncate oc-files-file-link-name oc-my-s" v-text="link.name" />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  setup() {},
  name: 'QuickLink',
  props: {
    link: {
      type: Object,
      required: true
    }
  }
})
</script>

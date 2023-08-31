<template>
  hello!

  {{ passwordPolicy }}
  <input v-bind="$attrs" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'OCTextInputPassword',
  status: 'ready',
  release: '1.0.0',
  inheritAttrs: true,
  props: {
    /**
     * The ID of the element.
     */
    passwordPolicy: {
      type: Object,
      required: false,
      default: () => {}
    }
  }
})
</script>

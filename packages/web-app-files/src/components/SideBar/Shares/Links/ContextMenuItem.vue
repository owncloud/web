<template>
  <oc-button
    appearance="raw"
    class="oc-p-s action-menu-item"
    :type="option.to ? 'router-link' : 'button'"
    :to="option.to"
    @click="option.method"
  >
    <oc-icon :name="option.icon" fill-type="line" size="medium" />
    <span v-text="option.title" />
  </oc-button>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { EditOption } from './EditDropdown.vue'

export default defineComponent({
  name: 'ContextMenuItem',
  props: {
    option: {
      type: Object as PropType<EditOption>,
      required: true
    }
  }
})
</script>

<template>
  <div
    class="loading-error-message oc-flex oc-flex-column oc-flex-center oc-flex-middle oc-text-center"
  >
    <oc-icon :name="icon" type="div" :fill-type="iconFillType" variation="danger" size="xlarge" />
    <p class="error-content oc-text-muted oc-text-xlarge oc-mt-s oc-px-m">
      <slot />
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LoadingErrorMessage',

  props: {
    icon: {
      type: String,
      default: 'file-damage'
    },
    iconFillType: {
      type: String,
      default: 'fill'
    }
  }
})
</script>

<style lang="scss">
.loading-error-message {
  height: 75vh;

  .error-content {
    max-width: 375px;
  }
}
</style>

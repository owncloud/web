<template>
  <div class="oc-height-1-1 oc-flex oc-flex-column oc-flex-center oc-flex-middle oc-text-center">
    <oc-icon :name="icon" type="div" size="xxlarge" />
    <div class="oc-text-muted oc-text-large">
      <slot name="message" />
    </div>
    <div class="oc-text-muted">
      <slot name="callToAction" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'NoContentMessage',

  props: {
    icon: {
      type: String,
      required: true
    }
  }
}
</script>

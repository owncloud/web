<template>
  <div class="uk-height-1-1 uk-flex uk-flex-column uk-flex-center uk-flex-middle uk-text-center">
    <oc-icon :name="icon" type="div" size="xxlarge" />
    <div class="oc-text-muted uk-text-large">
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

<template>
  <div class="uk-height-1-1 uk-flex uk-flex-column uk-flex-center uk-flex-middle uk-text-center">
    <oc-icon :name="icon" type="div" size="xxlarge" variation="system" aria-hidden="true" />
    <div class="uk-text-muted uk-text-large">
      <slot name="message" />
    </div>
    <div class="uk-text-muted">
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

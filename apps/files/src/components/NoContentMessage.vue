<template>
  <div class="uk-text-center">
    <oc-icon :name="icon" type="div" size="xlarge" variation="system" />
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

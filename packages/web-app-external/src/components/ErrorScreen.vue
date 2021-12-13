<template>
  <div class="uk-text-center">
    <oc-icon size="xxlarge" name="warning" />
    <p v-if="message" class="oc-text-lead">{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: 'ErrorScreen',
  props: {
    /**
     * Error message passed from external app
     */
    message: {
      default: '',
      type: String,
      required: false
    }
  }
}
</script>

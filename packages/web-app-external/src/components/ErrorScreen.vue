<template>
  <div class="uk-text-center">
    <oc-icon size="xxlarge" name="warning" />
    <h1 v-translate class="oc-text-lead">Error when loading the application</h1>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: 'ErrorScreen',
  props: {
    /**
     * error message
     */
    message: {
      default: '',
      type: String,
      required: false
    }
  }
}
</script>

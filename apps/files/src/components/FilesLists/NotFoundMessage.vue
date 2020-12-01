<template>
  <div class="uk-text-center">
    <oc-icon name="wb_cloudy" type="div" size="xxlarge" variation="system" />
    <div class="uk-text-muted uk-text-large">
      <translate>Resource not found</translate>
    </div>
    <div class="uk-text-muted">
      <translate>We went looking everywhere, but were unable to find this resource.</translate>
    </div>
    <div class="oc-mt-s">
      <oc-button v-if="showHomeButton" type="a" variation="raw" :href="route">
        <translate>Go to »All files«</translate>
      </oc-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFoundMessage',

  computed: {
    route() {
      // TODO: use config.json variable
      return '/'
    },

    showHomeButton() {
      return !this.publicPage()
    }
  }
}
</script>

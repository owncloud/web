<template>
  <oc-button
    v-oc-tooltip="label"
    type="a"
    :href="href"
    target="_blank"
    appearance="raw"
    :aria-label="label"
  >
    <oc-icon name="comment" />
  </oc-button>
</template>

<script>
export default {
  name: 'FeedbackLink',
  computed: {
    href() {
      return 'https://owncloud.com/web-design-feedback'
    },
    label() {
      return this.$gettext(
        "We'd like to improve the web design and would be happy to hear your feedback. Thank you! Your ownCloud team."
      )
    }
  }
}
</script>

<template>
  <div class="oc-flex">
    <oc-button
      v-oc-tooltip="description"
      type="a"
      :href="href"
      target="_blank"
      appearance="raw"
      variation="inverse"
      :aria-label="ariaLabel"
      aria-describedby="oc-feedback-link-description"
    >
      <oc-icon name="feedback" />
    </oc-button>
    <p id="oc-feedback-link-description" class="oc-invisible-sr" v-text="description" />
  </div>
</template>

<script>
export default {
  name: 'FeedbackLink',
  computed: {
    href() {
      return 'https://owncloud.com/web-design-feedback'
    },
    ariaLabel() {
      return this.$gettext('ownCloud feedback survey')
    },
    description() {
      return this.$gettext(
        "Provide your feedback: We'd like to improve the web design and would be happy to hear your feedback. Thank you! Your ownCloud team."
      )
    }
  }
}
</script>

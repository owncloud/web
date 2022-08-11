<template>
  <div class="oc-flex">
    <oc-button
      v-oc-tooltip="descriptionOrFallback"
      type="a"
      :href="hrefOrFallback"
      target="_blank"
      appearance="filled"
      variation="inverse"
      :aria-label="ariaLabelOrFallback"
      aria-describedby="oc-feedback-link-description"
    >
      <oc-icon name="feedback" />
      <span class="hide-below-1280" v-text="$gettext('Give feedback')" />
    </oc-button>
    <p id="oc-feedback-link-description" class="oc-invisible-sr" v-text="descriptionOrFallback" />
  </div>
</template>

<script>
export default {
  name: 'FeedbackLink',
  props: {
    href: {
      type: String,
      required: false,
      default: null
    },
    ariaLabel: {
      type: String,
      required: false,
      default: null
    },
    description: {
      type: String,
      required: false,
      default: null
    }
  },
  computed: {
    hrefOrFallback() {
      return this.href || 'https://owncloud.com/web-design-feedback'
    },
    ariaLabelOrFallback() {
      return this.ariaLabel || this.$gettext('ownCloud feedback survey')
    },
    descriptionOrFallback() {
      return (
        this.description ||
        this.$gettext(
          "Provide your feedback: We'd like to improve the web design and would be happy to hear your feedback. Thank you! Your ownCloud team."
        )
      )
    }
  }
}
</script>

<style lang="scss">
  .hide-below-1280 {
    display: flex;
  }
  
  @media only screen and (max-width: 1280px) {
    .hide-below-1280 {
      display: none;
    }
  }
</style>

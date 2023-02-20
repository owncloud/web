<template>
  <oc-modal
    :title="$gettext(title)"
    icon="information"
    button-cancel-text="Decline"
    button-confirm-text="Accept"
    class="oc-position-relative tos-modal"
    @cancel="decline"
    @confirm="accept"
  >
    <template #content>
      <iframe :src="src"></iframe>
    </template>
  </oc-modal>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: false,
      default: 'Terms of service'
    },
    src: {
      type: String,
      required: true
    }
  },
  methods: {
    accept() {
      this.$emit('accept')
    },
    decline() {
      this.$emit('decline')
    }
  }
}
</script>

<style lang="scss">
.tos-modal {
  .oc-modal {
    max-width: 1200px !important;
  }
  iframe {
    width: 100%;
    height: 80vh;
    background-color: white;
  }
}
</style>
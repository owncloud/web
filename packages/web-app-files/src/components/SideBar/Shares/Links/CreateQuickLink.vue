<template>
  <div class="oc-mb-s oc-width-1-1">
    <h4 class="oc-text-truncate oc-files-file-link-name oc-my-s" v-text="heading" />
    <div class="oc-flex oc-flex-middle oc-flex-between oc-width-1-1 oc-p-s link-name-container">
      <div class="oc-flex oc-flex-middle oc-text-truncate">
        <oc-icon name="link" fill-type="line" />
        <p class="oc-files-file-link-url oc-ml-s oc-text-truncate oc-my-rm" v-text="noLinkLabel" />
      </div>
      <oc-button v-oc-tooltip="label" :aria-label="label" @click="createQuickLink">
        <span v-text="createLinkLabel" />
      </oc-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CreateQuickLink',
  props: {
    expirationDate: {
      type: Object,
      default: () => {},
      required: false
    },
    passwordEnforced: {
      type: Object,
      default: () => {},
      required: false
    }
  },
  computed: {
    heading() {
      return this.$gettext('Quick link')
    },
    label() {
      return this.$gettext('Create quick link')
    },
    createLinkLabel() {
      return this.$gettext('Create link')
    },
    noLinkLabel() {
      return this.$gettext('No link')
    }
  },
  methods: {
    createQuickLink() {
      // handle expiredate && passwordenforcement
      this.$emit('createPublicLink', {
        link: {
          name: this.$gettext('Quicklink'),
          permissions: 1,
          quicklink: true
        },
        showError: (e) => {
          this.error = e
        }
      })
    }
  }
}
</script>

<style scoped>
.link-name-container {
  background-color: var(--oc-color-input-bg);
  border: 1px solid var(--oc-color-input-border);
}
</style>

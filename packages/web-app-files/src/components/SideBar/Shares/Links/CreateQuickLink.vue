<template>
  <div class="oc-mb-s oc-width-1-1 oc-mb-l">
    <h4 class="oc-text-truncate oc-text-normal oc-files-file-link-name oc-my-rm" v-text="heading" />
    <div class="oc-flex oc-flex-middle oc-flex-between oc-width-1-1 oc-p-s link-name-container">
      <div class="oc-flex oc-flex-middle oc-text-truncate">
        <oc-icon name="link" fill-type="line" />
        <p class="oc-files-file-link-url oc-ml-s oc-text-truncate oc-my-rm" v-text="noLinkLabel" />
      </div>
      <oc-button
        v-oc-tooltip="createLinkHint"
        appearance="raw"
        :aria-label="createLinkHint"
        @click="createQuickLink"
        v-text="createLinkLabel"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CreateQuickLink',
  props: {
    expirationDate: {
      type: Object,
      default: () => {},
      required: true
    }
  },
  emits: ['createPublicLink'],
  computed: {
    heading() {
      return this.$gettext('Quick link')
    },
    createLinkHint() {
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
      this.$emit('createPublicLink', {
        link: {
          name: this.$gettext('Quicklink'),
          permissions: 1,
          expiration: this.expirationDate.enforced ? this.expirationDate.default : null,
          quicklink: true,
          password: false
        }
      })
    }
  }
})
</script>

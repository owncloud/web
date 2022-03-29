<template>
  <oc-button
    id="files-toggle-sidebar"
    v-oc-tooltip="toggleSidebarButtonLabel"
    :aria-label="toggleSidebarButtonLabel"
    appearance="raw"
    class="oc-my-s oc-p-xs"
    @click.stop="toggleSidebar"
  >
    <oc-icon name="side-bar-right" :fill-type="toggleSidebarButtonIconFillType" />
  </oc-button>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState('Files/sidebar', { sidebarClosed: 'closed' }),

    toggleSidebarButtonLabel() {
      if (this.sidebarClosed) return this.$gettext('Open sidebar to view details')
      return this.$gettext('Close sidebar to hide details')
    },

    toggleSidebarButtonIconFillType() {
      return this.sidebarClosed ? 'line' : 'fill'
    }
  },
  methods: {
    ...mapActions('Files/sidebar', { toggleSidebar: 'toggle' })
  }
}
</script>

<style lang="scss" scoped>
#files-toggle-sidebar {
  vertical-align: middle;
  border: 3px solid transparent;
  &:hover {
    background-color: var(--oc-color-background-hover);
    border-radius: 3px;
  }
}
</style>

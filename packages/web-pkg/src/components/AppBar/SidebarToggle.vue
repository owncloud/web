<template>
  <oc-button
    id="files-toggle-sidebar"
    v-oc-tooltip="toggleSidebarButtonLabel"
    :aria-label="toggleSidebarButtonLabel"
    appearance="raw"
    class="oc-my-s oc-p-xs"
    @click.stop="toggleSideBar"
  >
    <oc-icon name="side-bar-right" :fill-type="toggleSidebarButtonIconFillType" />
  </oc-button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { eventBus } from '../../services/eventBus'
import { SideBarEventTopics } from '../../composables/sideBar'

export default defineComponent({
  props: {
    isSideBarOpen: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    toggleSidebarButtonLabel() {
      if (this.isSideBarOpen) {
        return this.$gettext('Close sidebar to hide details')
      }
      return this.$gettext('Open sidebar to view details')
    },

    toggleSidebarButtonIconFillType() {
      return this.isSideBarOpen ? 'fill' : 'line'
    }
  },
  methods: {
    toggleSideBar() {
      eventBus.publish(SideBarEventTopics.toggle)
    }
  }
})
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

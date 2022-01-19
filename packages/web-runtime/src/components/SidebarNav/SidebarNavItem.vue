<template>
  <li class="oc-sidebar-nav-item oc-pb-xs oc-px-s" :aria-current="active ? 'page' : null">
    <oc-button
      v-oc-tooltip="toolTip"
      type="router-link"
      appearance="raw"
      :variation="active ? 'inverse' : 'passive'"
      :class="['oc-sidebar-nav-item-link', { active: active }]"
      :to="target"
      :data-nav-id="index"
    >
      <oc-icon :name="icon" :fill-type="fillType" aria-hidden="true" />
      <span class="oc-ml-m text" :class="{ 'text-invisible': collapsed }" v-text="name" />
      <sidebar-nav-item-highlight :index="index" :active="active" />
    </oc-button>
  </li>
</template>
<script>
import SidebarNavItemHighlight from './SidebarNavItemHighlight.vue'

export default {
  components: {
    SidebarNavItemHighlight
  },
  props: {
    name: {
      type: String,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    active: {
      type: Boolean,
      required: false,
      default: false
    },
    target: {
      type: String,
      required: false,
      default: null
    },
    icon: {
      type: String,
      required: true
    },
    fillType: {
      type: String,
      required: false,
      default: 'fill'
    },
    collapsed: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    toolTip() {
      const value = this.collapsed
        ? this.$gettextInterpolate(this.$gettext('Navigate to %{ pageName } page'), {
            pageName: this.name
          })
        : ''
      return {
        content: value,
        placement: 'right',
        arrow: false
      }
    }
  }
}
</script>

<style lang="scss">
.oc-sidebar-nav-item-link {
  position: relative;
  align-items: center !important;
  display: flex !important;
  justify-content: flex-start !important;
  padding: var(--oc-space-small) var(--oc-space-small) !important;
  border-radius: 5px;
  white-space: nowrap;
  user-select: none;

  .text {
    opacity: 1;
    transition: all 0s;
    transition-delay: 0.1s;
  }
  .text-invisible {
    opacity: 0 !important;
    transition: 0s;
  }
  &:hover,
  &:focus {
    text-decoration: none !important;
  }
  &.active {
    cursor: default;
  }
}
</style>

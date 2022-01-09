<template>
  <li class="oc-sidebar-nav-item oc-pb-xs oc-px-s" :aria-current="active ? 'page' : null">
    <router-link
      v-oc-tooltip="toolTip"
      :class="['oc-sidebar-nav-item-link']"
      :to="target"
      :data-nav-id="index"
      @click.native="$refs.highlighter.goTo(index)"
    >
      <oc-icon :name="icon" :fill-type="fillType" variation="inverse" aria-hidden="true" />
      <span class="oc-ml-m text" :class="{ 'text-invisible': collapsed }" v-text="name" />
      <sidebar-nav-item-highlight :index="index" :active="this.active" ref="highlighter" />
    </router-link>
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
      return this.collapsed ? this.$gettext(`Navigate to ${this.name} page`) : ''
    }
  },
}
</script>

<style lang="scss">
.oc-sidebar-nav-item-link {
  position: relative;
  align-items: center;
  color: var(--oc-color-border);
  display: flex;
  font-weight: 400;
  padding: var(--oc-space-small) var(--oc-space-small);
  border-radius: 5px;
  white-space: nowrap;
  user-select: none;

  .text {
    opacity: 1;
    transition: all 0.35s ease-out;
  }
  .text-invisible {
    opacity: 0 !important;
    transition: 0s;
  }

  &.active {
    background: linear-gradient(90deg, #0869de 0%, #4e85c8 100%);
    cursor: default;
  }
  &:hover {
    color: var(--oc-color-text-inverse);
  }
  &:not(.active):hover {
    background: #383838;
  }
}
</style>

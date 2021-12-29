<template>
  <li class="oc-sidebar-nav-item oc-pb-xs oc-px-s" :aria-current="active ? 'page' : null">
    <router-link
      v-oc-tooltip="toolTip"
      :class="['oc-sidebar-nav-item-link', { active: active }]"
      :to="target"
    >
      <oc-icon :name="icon" variation="inverse" aria-hidden="true" />
      <span class="oc-ml-m text" :class="{ 'text-invisible': collapsed }" v-text="name" />
    </router-link>
  </li>
</template>
<script>
export default {
  props: {
    name: {
      type: String,
      required: false,
      default: ''
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
      required: true,
      default: ''
    },
    collapsed: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    toolTip() {
      if (this.collapsed) {
        return this.$gettext(`Navigate to ${this.name} page`)
      } else {
        return ''
      }
    }
  }
}
</script>

<style lang="scss">
.oc-sidebar-nav-item-link {
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
    text-decoration: none;
  }
  &:not(.active):hover {
    background: #383838;
  }
}
</style>

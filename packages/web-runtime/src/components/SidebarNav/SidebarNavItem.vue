<template functional>
  <li
    v-bind="data.attrs"
    :ref="data.ref"
    :class="[
      'oc-sidebar-nav-item',
      'oc-pb-xs',
      'oc-pl-s',
      'oc-pr-s',
      { 'oc-sidebar-nav-item-isolated': props.isolate },
      { 'oc-sidebar-nav-item-parent': slots().subnav },
      data.staticClass,
      data.class
    ]"
    :aria-current="props.active ? 'page' : null"
  >
    <router-link
      v-if="props.target"
      :id="props.id"
      :class="['oc-sidebar-nav-item-link', { active: props.active }]"
      :to="props.target"
    >
      <oc-icon
        :class="{ 'oc-sidebar-nav-item-icon': !props.collapsed }"
        :name="props.icon"
        variation="inverse"
        aria-hidden="true"
      />
      <slot name="default" />
    </router-link>
    <oc-button v-else appearance="raw" @click="$emit('click', $event)">
      <slot name="default" />
    </oc-button>
    <oc-list v-if="slots().subnav" class="oc-sidebar-nav-item-list">
      <slot name="subnav" />
    </oc-list>
  </li>
</template>
<script>
export default {
  props: {
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
    isolate: {
      type: Boolean,
      required: false,
      default: false
    },
    collapsed: {
      type: Boolean,
      required: false,
      default: false
    },
    id: {
      type: String,
      required: false,
      default: ''
    }
  }
}
</script>

<style lang="scss">
.oc-sidebar-nav-item {
  &-link {
    position: relative;
    align-items: center;
    -webkit-user-drag: none;
    color: var(--oc-color-border);
    display: flex;
    font-weight: 400;
    padding: var(--oc-space-small) var(--oc-space-small);
    border-radius: 5px;
    white-space: nowrap;
    user-select: none;

    &.active {
      color: var(--oc-color-text-inverse);
      border: 0px;
    }

    .oc-icon > svg {
      fill: var(--oc-color-border) !important;
    }

    &.active > .oc-icon > svg {
      fill: var(--oc-color-text-inverse) !important;
    }

    &:hover {
      text-decoration: none;
      color: var(--oc-color-text-inverse);
    }

    &.active {
      cursor: default;
    }
  }

  &-icon {
    margin-right: var(--oc-space-medium);
  }

  &-isolated {
    margin-top: var(--oc-space-medium);
  }

  &-list &-link {
    font-size: 0.875rem;
    padding-left: var(--oc-space-large);
  }
}
</style>

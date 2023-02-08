<template>
  <li
    ref="item"
    class="oc-sidebar-nav-item oc-pb-xs oc-px-s"
    :aria-current="active ? 'page' : null"
  >
    <oc-button
      v-oc-tooltip="toolTip"
      type="router-link"
      :appearance="active ? 'raw-inverse' : 'raw'"
      :class="['oc-sidebar-nav-item-link', { active: active }]"
      :to="target"
      :data-nav-id="index"
      :data-nav-name="navName"
    >
      <span class="oc-flex">
        <oc-icon :name="icon" :fill-type="fillType" />
        <span class="oc-ml-m text" :class="{ 'text-invisible': collapsed }" v-text="name" />
      </span>
      <oc-tag v-if="tag" class="oc-py-rm" size="small">{{ tag }}</oc-tag>
    </oc-button>
  </li>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { Router } from 'vue-router'

export default defineComponent({
  props: {
    name: {
      type: String,
      required: true
    },
    index: {
      type: String,
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
    },
    tag: {
      type: String,
      required: false,
      default: null
    }
  },
  computed: {
    navName() {
      return (this.$router as Router)?.resolve(this.target, this.$route)?.name || 'route.name'
    },
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
  },
  watch: {
    active(active) {
      if (!active) {
        return
      }
      this.animateHighlightPosition(this.index)
    }
  },
  mounted() {
    if (!this.active) {
      return
    }
    this.animateHighlightPosition(this.index)
  },
  methods: {
    animateHighlightPosition(target, durationSeconds = 0.2) {
      const highlightedElement = document.getElementById('nav-highlighter')
      if (!highlightedElement) {
        return
      }
      const targetElement = this.$refs.item
      const offset = targetElement.offsetTop
      const style = highlightedElement.style
      style.setProperty('transition-duration', `${durationSeconds}s`)
      style.setProperty('transform', `translateY(${offset}px)`)
    }
  }
})
</script>

<style lang="scss">
.oc-sidebar-nav-item-link {
  position: relative;
  align-items: center !important;
  display: flex !important;
  justify-content: space-between !important;
  padding: var(--oc-space-small) !important;
  border-radius: 5px;
  white-space: nowrap;
  user-select: none;

  .oc-tag {
    color: var(--oc-color-text-default);
    background-color: var(--oc-color-background-highlight);
  }
  .text {
    opacity: 1;
    transition: all 0.3s;
  }
  .text-invisible {
    opacity: 0 !important;
    transition: 0s;
  }

  &:hover:not(.active) {
    color: var(--oc-color-swatch-brand-hover) !important;
  }

  &:hover,
  &:focus {
    text-decoration: none !important;
  }
  &.active {
    overflow: hidden;
  }

  .oc-icon svg {
    transition: all 0.3s;
  }
}
</style>

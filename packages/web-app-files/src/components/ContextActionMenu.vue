<template>
  <div id="oc-files-context-menu">
    <oc-list
      v-for="(section, sectionIndex) in menuSections"
      :id="`oc-files-context-actions-${section.name}`"
      :key="`section-${section.name}-list`"
      class="oc-files-context-actions"
      :class="getSectionClasses(sectionIndex)"
    >
      <action-menu-item
        v-for="(action, actionIndex) in section.items"
        :key="`section-${section.name}-action-${actionIndex}`"
        :action="action"
        :items="items"
        :space="space"
        class="oc-files-context-action oc-px-s oc-rounded oc-menu-item-hover"
      />
    </oc-list>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
import ActionMenuItem from './ActionMenuItem.vue'
import { Resource } from 'web-client'
import { SpaceResource } from 'web-client/src/helpers'

export default defineComponent({
  name: 'ContextActionMenu',
  components: { ActionMenuItem },
  props: {
    menuSections: {
      type: Array,
      required: true
    },
    // items can e.g. be currentFolder (breadcrumbs) or selectedResources (resourceTable)
    items: {
      type: Array,
      required: true
    },
    space: {
      type: Object as PropType<SpaceResource>,
      required: true
    }
  },
  methods: {
    getSectionClasses(index) {
      const classes = []
      if (!this.menuSections.length) {
        return classes
      }
      if (index < this.menuSections.length - 1) {
        classes.push('oc-pb-s')
      }
      if (index > 0) {
        classes.push('oc-pt-s')
      }
      if (index < this.menuSections.length - 1) {
        classes.push('oc-files-context-actions-border')
      }
      return classes
    }
  }
})
</script>

<style lang="scss">
.oc-files-context-actions {
  text-align: left;
  white-space: normal;

  > li {
    padding-left: 0 !important;
    padding-right: 0 !important;
    a,
    button,
    span {
      display: inline-flex;
      font-weight: normal !important;
      gap: 10px;
      justify-content: flex-start;
      vertical-align: top;
      width: 100%;
      text-align: left;
    }
  }

  &-border {
    border-bottom: 1px solid var(--oc-color-border);
  }
}
</style>

<template>
  <div id="oc-files-context-menu">
    <context-drop>
      <template #drop-content>
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
            class="oc-files-context-action oc-px-s oc-rounded"
          />
        </oc-list>
      </template>
    </context-drop>
  </div>
</template>

<script>
import ActionMenuItem from './ActionMenuItem.vue'
import ContextDrop from './ContextDrop.vue'

export default {
  name: 'ContextActionMenu',
  components: { ActionMenuItem, ContextDrop },
  props: {
    menuSections: {
      type: Array,
      required: true
    },
    // items can e.g. be currentFolder (breadcrumbs) or selectedResources (resourceTable)
    items: {
      type: Array,
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
}
</script>

<style lang="scss">
.oc-files-context-actions {
  text-align: left;
  white-space: normal;

  > li {
    a,
    button,
    span {
      color: var(--oc-color-swatch-passive-default) !important;
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

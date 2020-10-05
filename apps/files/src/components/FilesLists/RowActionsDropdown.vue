<template>
  <oc-drop
    v-if="displayed"
    id="files-list-row-actions-dropdown"
    :boundary="`#files-file-list-action-button-${item.viewId}-active`"
    :options="{ offset: 0 }"
    :toggle="`#files-file-list-action-button-${item.viewId}-active`"
    position="bottom-right"
    class="uk-open uk-drop-stack"
  >
    <ul class="uk-list">
      <li v-for="action in actions" :key="action.ariaLabel(item)">
        <oc-button
          class="uk-width-1-1"
          :aria-Label="action.ariaLabel(item)"
          @click.stop="
            action.handler(item, action.handlerData)
            actionClicked()
          "
        >
          <oc-icon :name="action.icon" aria-hidden="true" size="medium" />
          {{ action.ariaLabel(item) }}
        </oc-button>
      </li>
    </ul>
  </oc-drop>
</template>

<script>
export default {
  name: 'FileActionsDropdown',
  props: {
    /**
     * Defines if the dropdown is visible
     */
    displayed: {
      type: Boolean,
      required: true,
      default: false
    },
    /**
     * Target item
     */
    item: {
      type: Object,
      required: true
    },
    /**
     * Item actions to be displayed inside of the dropdown
     */
    actions: {
      type: Array,
      required: true
    }
  },
  methods: {
    actionClicked() {
      this.$emit('actionClicked')
    },
    // FIXME: Remove as soon as trashbin has virtual scroll
    nameForDropdownData(name) {
      // Escape double quotes inside of selector
      if (name.indexOf('"') > -1) {
        name = name.replace(/\\([\s\S])|(")/g, '&quot;')
      }

      return name
    }
  }
}
</script>

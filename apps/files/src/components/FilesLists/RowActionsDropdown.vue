<template>
  <oc-drop
    v-if="displayed"
    :boundary="`#files-file-list-action-button-${item.id}-active`"
    :options="{ offset: 0 }"
    :toggle="`#files-file-list-action-button-${item.id}-active`"
    position="bottom-right"
    id="files-list-row-actions-dropdown"
    class="uk-open uk-drop-stack"
  >
    <ul class="uk-list">
      <li v-for="action in actions" :key="action.ariaLabel">
        <oc-button
          class="uk-width-1-1"
          @click.native.stop="action.handler(item, action.handlerData); actionClicked()"
          :icon="action.icon"
          :ariaLabel="action.ariaLabel"
        >
          {{ action.ariaLabel }}
        </oc-button>
      </li>
    </ul>
  </oc-drop>
</template>

<script>
import { mapGetters } from 'vuex'

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
  computed: {
    ...mapGetters('Files', ['isDialogOpen'])
  },
  methods: {
    actionClicked () {
      this.$emit('actionClicked')
    },
    // FIXME: Remove as soon as trashbin has virtual scroll
    nameForDropdownData (name) {
      // Escape double quotes inside of selector
      if (name.indexOf('"') > -1) {
        name = name.replace(/\\([\s\S])|(")/g, '&quot;')
      }

      return name
    }
  }
}
</script>

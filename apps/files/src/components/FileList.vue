<template>
  <!-- TODO: Take care of outside click overall and not just in files list -->
  <div :id="id" class="uk-height-1-1 uk-position-relative" @click="hideRowActionsDropdown">
    <div class="uk-flex uk-flex-column uk-height-1-1">
      <resize-observer @notify="$_resizeHeader" />
      <oc-grid
        v-if="fileData.length > 0"
        id="files-table-header"
        ref="headerRow"
        key="files-list-results-existence"
        gutter="small"
        flex
        class="uk-padding-small uk-padding-remove-top oc-padding-xsmall-bottom oc-border-bottom"
      >
        <div v-if="checkboxEnabled">
          <oc-checkbox
            id="filelist-check-all"
            class="uk-margin-small-left"
            :hide-label="true"
            :label="labelSelectAllItems"
            :value="selectedAll"
            @click.stop
            @change.native="toggleAll"
          />
        </div>
        <slot name="headerColumns" />
        <div
          v-if="$scopedSlots.rowActions"
          class="uk-text-nowrap uk-text-meta uk-text-right uk-width-small"
        >
          <translate translate-context="Short column label in files table for the actions"
            >Actions</translate
          >
        </div>
      </oc-grid>
      <div v-if="!loading" id="files-list-container" class="uk-overflow-auto">
        <RecycleScroller
          v-if="fileData.length"
          v-slot="{ item: rowItem, index, active }"
          :key="fileData.length"
          class="uk-height-1-1"
          :items="fileData"
          :item-size="hasTwoRows ? 77 : 55"
        >
          <div
            :data-is-visible="active"
            :class="{ 'files-list-row-disabled': rowDisabled(rowItem) }"
            @click="
              selectRow(rowItem, $event)
              hideRowActionsDropdown()
            "
          >
            <oc-grid
              :id="'file-row-' + rowItem.viewId"
              :ref="index === 0 ? 'firstRow' : null"
              gutter="small"
              flex
              class="uk-padding-small oc-border-bottom"
              :class="_rowClasses(rowItem)"
            >
              <div v-if="checkboxEnabled">
                <oc-checkbox
                  class="uk-margin-small-left"
                  :value="selectedFiles.indexOf(rowItem) >= 0"
                  :label="labelSelectSingleItem(rowItem)"
                  :hide-label="true"
                  @click.stop
                  @change.native="toggleFileSelect(rowItem)"
                />
              </div>
              <slot name="rowColumns" :item="rowItem" :index="index" />
              <div
                v-if="actions.length > 1 || $scopedSlots.rowActions"
                class="uk-flex uk-flex-middle uk-flex-right"
                :class="{ 'uk-width-small': $scopedSlots.rowActions }"
              >
                <slot name="rowActions" :item="rowItem" />
                <oc-button
                  :id="actionsDropdownButtonId(rowItem.viewId, active)"
                  class="files-list-row-show-actions"
                  :disabled="$_actionInProgress(rowItem)"
                  :aria-label="$gettext('Show file actions')"
                  variation="raw"
                  @click.stop="toggleRowActionsDropdown(rowItem)"
                >
                  <oc-icon name="more_vert" class="uk-text-middle" size="small" />
                </oc-button>
              </div>
            </oc-grid>
          </div>
        </RecycleScroller>
        <div
          v-else
          key="files-list-results-absence"
          class="uk-position-center files-list-no-content-message"
        >
          <slot name="noContentMessage" />
        </div>
      </div>
      <oc-grid v-if="!loading" gutter="large" class="uk-width-1-1 uk-padding-small uk-flex-1">
        <slot name="footer" />
      </oc-grid>
    </div>
    <row-actions-dropdown
      :displayed="rowActionsDisplayed"
      :item="rowActionsItem"
      :actions="rowActions"
      @actionClicked="hideRowActionsDropdown"
    />
  </div>
</template>
<script>
import { mapGetters, mapActions, mapState } from 'vuex'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

import RowActionsDropdown from './FilesLists/RowActionsDropdown.vue'

export default {
  name: 'FileList',
  components: {
    RecycleScroller,
    RowActionsDropdown
  },
  props: {
    id: {
      type: String,
      required: true
    },
    fileData: {
      type: Array,
      required: true
    },
    starsEnabled: {
      type: Boolean
    },
    checkboxEnabled: {
      type: Boolean,
      required: false,
      default: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    actions: {
      type: Array,
      required: true
    },
    compactMode: {
      type: Boolean,
      default: false
    },
    isActionEnabled: {
      type: Function,
      required: true
    },
    selectableRow: {
      type: Boolean,
      required: false,
      default: true
    },
    hasTwoRows: {
      type: Boolean,
      required: false,
      default: false
    },
    rowDisabled: {
      type: Function,
      required: false,
      default: () => false
    }
  },
  data() {
    return {
      labelSelectAllItems: this.$gettext('Select all items'),
      rowActions: [],
      rowActionsDisplayed: false,
      rowActionsItem: {}
    }
  },
  computed: {
    ...mapState(['route']),
    ...mapGetters('Files', [
      'selectedFiles',
      'highlightedFile',
      'activeFiles',
      'quota',
      'filesTotalSize',
      'activeFilesCount',
      'actionsInProgress'
    ]),
    ...mapGetters(['configuration']),

    selectedAll() {
      return this.selectedFiles.length === this.fileData.length && this.fileData.length !== 0
    },

    item() {
      return this.$route.params.item
    }
  },
  watch: {
    compactMode(val) {
      // sidebar opens, recalculate header sizes
      this.$_resizeHeader()
    }
  },
  methods: {
    ...mapActions('Files', [
      'loadFolder',
      'setHighlightedFile',
      'setPublicLinkPassword',
      'resetFileSelection',
      'addFileSelection',
      'removeFileSelection',
      'toggleFileSelection'
    ]),

    labelSelectSingleItem(item) {
      const labelSelectSingleFileText = this.$gettext('Select file %{name}')
      const labelSelectSingleFolderText = this.$gettext('Select folder %{name}')

      return this.$gettextInterpolate(
        item.type === 'file' ? labelSelectSingleFileText : labelSelectSingleFolderText,
        { name: item.name },
        true
      )
    },
    $_ocFileName(item) {
      if (this.$route.name === 'files-favorites') {
        const pathSplit = item.path.substr(1).split('/')
        if (pathSplit.length === 2) return `${pathSplit[pathSplit.length - 2]}/${item.basename}`
        if (pathSplit.length > 2) return `…/${pathSplit[pathSplit.length - 2]}/${item.basename}`
      }
      return item.basename
    },

    $_enabledActions(item) {
      return this.actions.filter(action => this.$_isActionEnabled(item, action))
    },

    $_isActionEnabled(item, action) {
      if (this.isActionEnabled && this.isActionEnabled(item, action)) {
        return true
      }
      return false
    },

    $_actionInProgress(item) {
      return this.actionsInProgress.some(itemInProgress => itemInProgress.id === item.id)
    },

    $_disabledActionTooltip(item) {
      if (this.$_actionInProgress(item)) {
        if (item.type === 'folder') {
          return this.$gettext('There is currently an action in progress for this folder')
        }

        return this.$gettext('There is currently an action in progress for this file')
      }

      return null
    },
    _rowClasses(item) {
      if (this.highlightedFile && item.id === this.highlightedFile.id) {
        return 'file-row oc-background-selected'
      }
      return 'file-row'
    },
    selectRow(item, event) {
      if (!this.selectableRow || this.rowDisabled(item)) {
        return
      }

      if (item.status && (item.status === 1 || item.status === 2)) return

      event.stopPropagation()
      this.setHighlightedFile(item)
    },

    toggleFileSelect(item) {
      this.toggleFileSelection(item)
      this.$emit('toggle', item)
    },

    toggleAll() {
      if (this.selectedFiles.length && this.selectedFiles.length === this.fileData.length) {
        this.resetFileSelection()
      } else {
        const selectedFiles = this.fileData.slice()
        for (const item of selectedFiles) {
          if (!this.selectedFiles.includes(item)) {
            this.addFileSelection(item)
          }
        }
      }
    },

    toggleRowActionsDropdown(item) {
      if (item === this.rowActionsItem) {
        this.hideRowActionsDropdown()
        return
      }

      this.rowActionsDisplayed = true
      this.rowActionsItem = item
      this.rowActions = this.$_enabledActions(item)
    },

    hideRowActionsDropdown() {
      this.rowActionsDisplayed = false
      this.rowActionsItem = {}
      this.rowActions = []
    },

    actionsDropdownButtonId(viewId, active) {
      if (active) {
        return `files-file-list-action-button-${viewId}-active`
      }

      return `files-file-list-action-button-${viewId}`
    },

    $_resizeHeader() {
      this.$nextTick(() => {
        const headerRow = this.$refs.headerRow
        const firstRow = this.$refs.firstRow
        if (headerRow && firstRow) {
          headerRow.$el.style.width = getComputedStyle(firstRow.$el).width
        }
      })
    }
  }
}
</script>

<style scoped>
.files-list-row-disabled {
  opacity: 0.3;
  pointer-events: none;
}

/* TODO: Create as utility classes in ODS */
/* Issue: https://github.com/owncloud/owncloud-design-system/issues/821 */
.oc-padding-xsmall-bottom {
  padding-bottom: 5px !important;
}
</style>

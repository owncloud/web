<template>
  <!-- TODO: Take care of outside click overall and not just in files list -->
  <div :id="id" class="uk-height-1-1 uk-position-relative" @click="hideRowActionsDropdown">
    <div class="uk-flex uk-flex-column uk-height-1-1">
      <resize-observer @notify="$_resizeHeader" />
      <oc-grid ref="headerRow" gutter="small" flex id="files-table-header" class="uk-padding-small" v-if="fileData.length > 0" key="files-list-results-existence">
        <div>
          <oc-checkbox
            class="uk-margin-small-left"
            id="filelist-check-all"
            :hideLabel="true"
            :label="labelSelectAllItems"
            @click.stop
            @change.native="toggleAll"
            :value="selectedAll"
          />
        </div>
        <slot name="headerColumns"/>
        <div class="uk-margin-small-right oc-icon" />
      </oc-grid>
      <div id="files-list-container" class="uk-flex-1 uk-overflow-auto" v-if="!loading">
        <RecycleScroller
          class="uk-height-1-1"
          :items="fileData"
          :item-size="55"
          v-slot="{ item, index, active }"
          v-if="fileData.length"
          :key="fileData.length"
        >
          <div
            :data-is-visible="active"
            @click="selectRow(item, $event); hideRowActionsDropdown()"
          >
            <oc-grid :ref="index === 0 ? 'firstRow' : null" gutter="small" flex class="uk-padding-small oc-border-top" :class="_rowClasses(item)" :id="'file-row-' + item.id">
              <div>
                <oc-checkbox
                  class="uk-margin-small-left"
                  @click.stop @change.native="toggleFileSelect(item)"
                  :value="selectedFiles.indexOf(item) >= 0"
                  :label="labelSelectSingleItem(item)"
                  :hideLabel="true"
                />
              </div>
              <slot name="rowColumns" :item="item" :index="index" />
              <div class="uk-text-right uk-margin-small-right">
                <oc-button
                  :id="actionsDropdownButtonId(item.id, active)"
                  class="files-list-row-show-actions"
                  :disabled="$_actionInProgress(item)"
                  :aria-label="$gettext('Show file actions')"
                  @click.stop="toggleRowActionsDropdown(item)"
                  variation="raw"
                >
                  <oc-icon
                    name="more_vert"
                    class="uk-text-middle"
                    size="small"
                  />
                </oc-button>
              </div>
            </oc-grid>
          </div>
        </RecycleScroller>
        <div v-else class="uk-position-center files-list-no-content-message" key="files-list-results-absence">
          <slot name="noContentMessage" />
        </div>
      </div>
      <oc-grid gutter="large" class="uk-width-1-1 uk-padding-small" v-if="!loading">
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

const RowActionsDropdown = () => import('./FilesLists/RowActionsDropdown.vue')

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
      type: Boolean
    },
    dateEnabled: {
      type: String
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
    }
  },
  data () {
    return {
      labelSelectAllItems: this.$gettext('Select all items'),
      labelSelectSingleItemText: this.$gettext('Select %{type} %{name}'),
      rowActions: [],
      rowActionsDisplayed: false,
      rowActionsItem: {}
    }
  },
  computed: {
    ...mapState(['route']),
    ...mapGetters('Files', ['selectedFiles', 'highlightedFile', 'activeFiles', 'quota',
      'filesTotalSize', 'activeFilesCount', 'actionsInProgress']),
    ...mapGetters(['configuration']),

    selectedAll () {
      return this.selectedFiles.length === this.fileData.length && this.fileData.length !== 0
    },

    item () {
      return this.$route.params.item
    }
  },
  watch: {
    compactMode (val) {
      // sidebar opens, recalculate header sizes
      this.$_resizeHeader()
    }
  },
  methods: {
    ...mapActions('Files', ['loadFolder', 'markFavorite',
      'setHighlightedFile', 'setPublicLinkPassword',
      'resetFileSelection', 'addFileSelection', 'removeFileSelection', 'toggleFileSelection'
    ]),

    $_ocFilesFolder_getFolder () {
      let absolutePath

      if (this.configuration.rootFolder) {
        absolutePath = !this.item ? this.configuration.rootFolder : this.item
      } else {
        absolutePath = !this.item ? this.configuration.rootFolder : this.item
      }

      this.loadFolder({
        client: this.$client,
        absolutePath: absolutePath,
        $gettext: this.$gettext,
        routeName: this.$route.name
      }).then(() => {
        const scrollTo = this.$route.query.scrollTo
        if (scrollTo && this.activeFiles.length > 0) {
          this.$nextTick(() => {
            const file = this.activeFiles.find(item => item.name === scrollTo)
            this.setHighlightedFile(file)
            this.$scrollTo(`#file-row-${file.id}`, 500, {
              container: '#files-list-container'
            })
          })
        }
      }).catch((error) => {
        // password for public link shares is missing -> this is handled on the caller side
        if (this.publicPage() && error.statusCode === 401) {
          this.$router.push({
            name: 'public-link',
            params: {
              token: this.$route.params.item
            }
          })
          return
        }
        this.showMessage({
          title: this.$gettext('Loading folder failed…'),
          desc: error.message,
          status: 'danger'
        })
      })
    },
    labelSelectSingleItem (item) {
      return this.$gettextInterpolate(this.labelSelectSingleItemText, { name: item.name, type: item.type }, true)
    },
    toggleFileFavorite (item) {
      this.markFavorite({
        client: this.$client,
        file: item
      })
    },
    $_ocFileName (item) {
      if (this.$route.name === 'files-favorites') {
        const pathSplit = item.path.substr(1).split('/')
        if (pathSplit.length === 2) return `${pathSplit[pathSplit.length - 2]}/${item.basename}`
        if (pathSplit.length > 2) return `…/${pathSplit[pathSplit.length - 2]}/${item.basename}`
      }
      return item.basename
    },

    $_enabledActions (item) {
      return this.actions.filter(action => this.$_isActionEnabled(item, action))
    },

    $_isActionEnabled (item, action) {
      if (this.isActionEnabled && this.isActionEnabled(item, action)) {
        return true
      }
      return false
    },

    $_actionInProgress (item) {
      return this.actionsInProgress.some(itemInProgress => itemInProgress.id === item.id)
    },

    $_disabledActionTooltip (item) {
      if (this.$_actionInProgress(item)) {
        if (item.type === 'folder') {
          return this.$gettext('There is currently an action in progress for this folder')
        }

        return this.$gettext('There is currently an action in progress for this file')
      }

      return null
    },
    _rowClasses (item) {
      if (this.highlightedFile && item.id === this.highlightedFile.id) {
        return 'file-row oc-background-selected'
      }
      return 'file-row'
    },
    selectRow (item, event) {
      if (!this.selectableRow) return

      if (item.status && (item.status === 1 || item.status === 2)) return

      event.stopPropagation()
      this.setHighlightedFile(item)
    },

    toggleFileSelect (item) {
      this.toggleFileSelection(item)
      this.$emit('toggle', item)
    },

    toggleAll () {
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

    toggleRowActionsDropdown (item) {
      if (item === this.rowActionsItem) {
        this.hideRowActionsDropdown()
        return
      }

      this.rowActionsDisplayed = true
      this.rowActionsItem = item
      this.rowActions = this.$_enabledActions(item)
    },

    hideRowActionsDropdown () {
      this.rowActionsDisplayed = false
      this.rowActionsItem = {}
      this.rowActions = []
    },

    actionsDropdownButtonId (id, active) {
      if (active) {
        return `files-file-list-action-button-${id}-active`
      }

      return `files-file-list-action-button-${id}`
    },

    $_resizeHeader () {
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

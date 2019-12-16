<template>
  <div class="uk-height-1-1">
    <div class="uk-flex uk-flex-column uk-height-1-1">
      <div id="files-list-container" class="uk-overflow-auto uk-flex-auto">
        <oc-table middle divider class="oc-filelist uk-margin-remove-bottom" :id="id" v-show="!loading">
          <thead>
            <oc-table-row>
              <oc-table-cell shrink type="head">
                <oc-checkbox class="uk-margin-small-left" id="filelist-check-all" :hideLabel="true" :label="labelSelectAllItems" @click.stop @change.native="toggleAll" :value="selectedAll" />
              </oc-table-cell>
              <slot name="headerColumns"/>
              <oc-table-cell shrink type="head" :class="{ 'uk-visible@s' : compactMode }" v-translate>Actions</oc-table-cell>
            </oc-table-row>
          </thead>
          <oc-table-group>
            <oc-table-row v-for="(item, index) in fileData" :key="index" :class="_rowClasses(item)" @click="selectRow(item, $event)" :id="'file-row-' + item.id">
              <oc-table-cell>
                <oc-checkbox :hideLabel="true" class="uk-margin-small-left" @click.stop @change.native="toggleFileSelect(item)" :value="selectedFiles.indexOf(item) >= 0" :label="labelSelectSingleItem(item)"/>
              </oc-table-cell>
              <slot name="rowColumns" :item="item" :index="index" />
              <oc-table-cell :class="{ 'uk-visible@s' : compactMode }" class="uk-position-relative">
                <div class="uk-button-group uk-margin-small-right" :class="{ 'uk-visible@m' : !compactMode, 'uk-visible@xl' : compactMode  }">
                  <oc-button
                    v-for="action in actions"
                   :key="action.ariaLabel"
                   @click.stop="action.handler(item, action.handlerData)"
                   :disabled="!$_isActionEnabled(item, action) || $_actionInProgress(item)"
                   :icon="action.icon"
                   :ariaLabel="action.ariaLabel"
                   :uk-tooltip="$_disabledActionTooltip(item)"
                  />
                </div>
                <oc-button
                  :id="'files-file-list-action-button-small-resolution-' + index"
                  icon="more_vert"
                  :class="{ 'uk-hidden@m' : !compactMode, 'uk-visible@s uk-hidden@xl' : compactMode }"
                  :disabled="$_actionInProgress(item)"
                  :aria-label="'show-file-actions'"
                  @click.stop
                />
                <oc-drop
                  v-if="!isDialogOpen"
                  :toggle="'#files-file-list-action-button-small-resolution-' + index"
                  :options="{ offset: 0 }"
                  position="bottom-right"
                >
                  <ul class="uk-list">
                    <li v-for="action in $_enabledActions(item)" :key="action.ariaLabel">
                      <oc-button
                        class="uk-width-1-1"
                        @click.native.stop="action.handler(item, action.handlerData)"
                        :icon="action.icon"
                        :ariaLabel="action.ariaLabel"
                      >
                        {{ action.ariaLabel }}
                      </oc-button>
                    </li>
                  </ul>
                </oc-drop>
              </oc-table-cell>
            </oc-table-row>
          </oc-table-group>
        </oc-table>
      </div>
      <oc-grid gutter="large" class="uk-width-1-1 uk-padding-small" v-if="!loading">
        <slot name="footer" />
      </oc-grid>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapActions, mapState } from 'vuex'

export default {
  name: 'FileList',
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
    }
  },
  data () {
    return {
      labelSelectAllItems: this.$gettext('Select all items'),
      labelSelectSingleItemText: this.$gettext('Select %{type} %{name}')
    }
  },
  methods: {
    ...mapActions('Files', ['loadFolder', 'setFilterTerm', 'markFavorite',
      'setHighlightedFile', 'setPublicLinkPassword',
      'resetFileSelection', 'addFileSelection', 'removeFileSelection', 'toggleFileSelection'
    ]),

    $_ocFilesFolder_getFolder () {
      this.setFilterTerm('')
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
        return 'file-row uk-active'
      }
      return 'file-row'
    },
    selectRow (item, event) {
      if (event.target.tagName !== 'TD') {
        return
      }

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
    }
  },
  computed: {
    ...mapState(['route']),
    ...mapGetters('Files', ['selectedFiles', 'highlightedFile', 'activeFiles', 'quota',
      'filesTotalSize', 'activeFilesCount', 'actionsInProgress', 'isDialogOpen']),
    ...mapGetters(['configuration']),

    selectedAll () {
      return this.selectedFiles.length === this.fileData.length && this.fileData.length !== 0
    },

    item () {
      return this.$route.params.item
    }
  }
}
</script>

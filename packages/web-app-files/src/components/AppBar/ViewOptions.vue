<template>
  <div>
    <oc-button
      id="files-view-options-btn"
      key="files-view-options-btn"
      v-oc-tooltip="viewOptionsButtonLabel"
      data-testid="files-view-options-btn"
      :aria-label="viewOptionsButtonLabel"
      appearance="raw"
      class="oc-my-s oc-p-xs"
    >
      <oc-icon name="settings-3" fill-type="line" />
    </oc-button>
    <oc-drop
      drop-id="files-view-options-drop"
      toggle="#files-view-options-btn"
      mode="click"
      class="oc-width-auto"
      padding-size="medium"
    >
      <oc-list>
        <li class="files-view-options-list-item oc-mb-m">
          <oc-switch
            v-model="hiddenFilesShownModel"
            data-testid="files-switch-hidden-files"
            :label="$gettext('Show hidden files')"
          />
        </li>
        <li class="files-view-options-list-item oc-my-m">
          <oc-switch
            v-model="fileExtensionsShownModel"
            data-testid="files-switch-files-extensions-files"
            :label="$gettext('Show file extensions')"
          />
        </li>
        <li class="files-view-options-list-item oc-mt-m">
          <oc-page-size
            v-model="itemsPerPage"
            data-testid="files-pagination-size"
            :label="$gettext('Items per page')"
            :options="[100, 500, 1000, $gettext('All')]"
            class="files-pagination-size"
          />
        </li>
      </oc-list>
    </oc-drop>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import { useRouteQueryPersisted } from 'web-pkg/src/composables'
import { PaginationConstants } from '../../composables'

export default {
  setup() {
    const perPageQuery = useRouteQueryPersisted({
      name: PaginationConstants.perPageQueryName,
      defaultValue: PaginationConstants.perPageDefault
    })

    return {
      itemsPerPage: perPageQuery
    }
  },
  computed: {
    ...mapState('Files', ['areHiddenFilesShown', 'areFileExtensionsShown']),

    viewOptionsButtonLabel() {
      return this.$gettext('Display customization options of the files list')
    },

    hiddenFilesShownModel: {
      get() {
        return this.areHiddenFilesShown
      },

      set(value) {
        this.SET_HIDDEN_FILES_VISIBILITY(value)
      }
    },
    fileExtensionsShownModel: {
      get() {
        return this.areFileExtensionsShown
      },

      set(value) {
        this.SET_FILE_EXTENSIONS_VISIBILITY(value)
      }
    }
  },
  methods: {
    ...mapMutations('Files', ['SET_HIDDEN_FILES_VISIBILITY', 'SET_FILE_EXTENSIONS_VISIBILITY'])
  }
}
</script>

<style lang="scss" scoped>
#files-view-options-btn {
  vertical-align: middle;
  border: 3px solid transparent;
  &:hover {
    background-color: var(--oc-color-background-hover);
    border-radius: 3px;
  }
}
.files-view-options-list-item {
  & > * {
    display: flex;
    justify-content: space-between;
  }

  & + & {
    margin-top: var(--oc-space-small);
  }
}
</style>

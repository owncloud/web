<template>
  <div class="oc-flex oc-flex-middle">
    <div
      v-if="viewModes.length"
      class="viewmode-switch-buttons oc-button-group oc-visible@s oc-mr-s"
    >
      <oc-button
        v-for="viewMode in viewModes"
        :key="viewMode.name"
        v-oc-tooltip="$gettext(viewMode.label)"
        :class="viewMode.name"
        :appearance="viewModeCurrent === viewMode.name ? 'filled' : 'outline'"
        :aria-label="$gettext(viewMode.label)"
        @click="setViewMode(viewMode)"
      >
        <oc-icon :name="viewMode.icon.name" :fill-type="viewMode.icon.fillType" size="small" />
      </oc-button>
    </div>
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
            v-model:checked="hiddenFilesShownModel"
            data-testid="files-switch-hidden-files"
            :label="$gettext('Show hidden files')"
            @update:checked="updateHiddenFilesShownModel"
          />
        </li>
        <li class="files-view-options-list-item oc-my-m">
          <oc-switch
            v-model:checked="fileExtensionsShownModel"
            data-testid="files-switch-files-extensions-files"
            :label="$gettext('Show file extensions')"
            @update:checked="updateFileExtensionsShownModel"
          />
        </li>
        <li class="files-view-options-list-item oc-mt-m">
          <oc-page-size
            v-if="!queryParamsLoading"
            :selected="itemsPerPage"
            data-testid="files-pagination-size"
            :label="$gettext('Items per page')"
            :options="[100, 500]"
            class="files-pagination-size"
            @change="itemsPerPage = $event"
          />
        </li>
      </oc-list>
    </oc-drop>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue'
import { mapMutations, mapState } from 'vuex'
import { useRouteQueryPersisted } from 'web-pkg/src/composables'
import { ViewMode } from 'web-pkg/src/ui/types'
import { PaginationConstants, ViewModeConstants } from '../../composables'

export default defineComponent({
  props: {
    viewModes: {
      type: Array as PropType<ViewMode[]>,
      default: () => []
    }
  },
  setup() {
    const queryParamsLoading = ref(false)
    const perPageQuery = useRouteQueryPersisted({
      name: PaginationConstants.perPageQueryName,
      defaultValue: PaginationConstants.perPageDefault
    })
    const viewModeQuery = useRouteQueryPersisted({
      name: ViewModeConstants.queryName,
      defaultValue: ViewModeConstants.defaultModeName
    })
    watch(
      [perPageQuery, viewModeQuery],
      (params) => {
        queryParamsLoading.value = params.some((p) => !p)
      },
      { immediate: true, deep: true }
    )

    return {
      ViewModeConstants,
      viewModeCurrent: viewModeQuery,
      itemsPerPage: perPageQuery,
      queryParamsLoading
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
    ...mapMutations('Files', ['SET_HIDDEN_FILES_VISIBILITY', 'SET_FILE_EXTENSIONS_VISIBILITY']),
    setViewMode(mode) {
      this.viewModeCurrent = mode.name
    },
    updateHiddenFilesShownModel(event) {
      this.hiddenFilesShownModel = event
    },
    updateFileExtensionsShownModel(event) {
      this.fileExtensionsShownModel = event
    }
  }
})
</script>

<style lang="scss" scoped>
.viewmode-switch-buttons {
  flex-flow: initial;
}

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

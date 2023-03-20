<template>
  <div class="oc-flex oc-flex-middle">
    <div
      v-if="viewModes.length > 1"
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
        <li v-if="hasHiddenFiles" class="files-view-options-list-item">
          <oc-switch
            v-model:checked="hiddenFilesShownModel"
            data-testid="files-switch-hidden-files"
            :label="$gettext('Show hidden files')"
            @update:checked="updateHiddenFilesShownModel"
          />
        </li>
        <li v-if="hasFileExtensions" class="files-view-options-list-item">
          <oc-switch
            v-model:checked="fileExtensionsShownModel"
            data-testid="files-switch-files-extensions-files"
            :label="$gettext('Show file extensions')"
            @update:checked="updateFileExtensionsShownModel"
          />
        </li>
        <li v-if="hasPagination" class="files-view-options-list-item">
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
        <li
          v-if="viewModes.includes(ViewModeConstants.tilesView)"
          class="files-view-options-list-item oc-visible@s oc-flex oc-flex-between oc-flex-middle"
        >
          <label for="tiles-size-slider" v-text="resizeTilesLabel" />
          <input
            v-model="viewSizeCurrent"
            type="range"
            min="1"
            max="6"
            name="tiles-size-slider"
            class="oc-range"
            data-testid="files-tiles-size-slider"
            @input="setTilesViewSize"
          />
        </li>
      </oc-list>
    </oc-drop>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, unref, watch } from 'vue'
import { mapMutations, mapState } from 'vuex'
import { queryItemAsString, useRouteQueryPersisted } from 'web-pkg/src/composables'
import { ViewMode } from 'web-pkg/src/ui/types'
import { PaginationConstants, ViewModeConstants } from '../../composables'

export default defineComponent({
  props: {
    hasHiddenFiles: { type: Boolean, default: true },
    hasFileExtensions: { type: Boolean, default: true },
    hasPagination: { type: Boolean, default: true },
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
    const itemsPerPage = computed(() => {
      return queryItemAsString(unref(perPageQuery))
    })
    const viewModeQuery = useRouteQueryPersisted({
      name: ViewModeConstants.queryName,
      defaultValue: ViewModeConstants.defaultModeName
    })
    const viewSizeQuery = useRouteQueryPersisted({
      name: ViewModeConstants.tilesSizeQueryName,
      defaultValue: ViewModeConstants.tilesSizeDefault.toString()
    })

    const setTilesViewSize = () => {
      const rootStyle = (document.querySelector(':root') as HTMLElement).style
      const currentSize = rootStyle.getPropertyValue('--oc-size-tiles-resize-step')
      const newSize = `${(unref(viewSizeQuery) as any) * 12}rem`
      if (!currentSize || currentSize !== newSize) {
        rootStyle.setProperty(`--oc-size-tiles-resize-step`, newSize)
      }
    }

    watch(
      [perPageQuery, viewModeQuery, viewSizeQuery],
      (params) => {
        queryParamsLoading.value = params.some((p) => !p)
      },
      { immediate: true, deep: true }
    )

    watch(
      viewSizeQuery,
      (size) => {
        if (size) {
          setTilesViewSize()
        }
      },
      { immediate: true }
    )

    return {
      ViewModeConstants,
      viewModeCurrent: viewModeQuery,
      viewSizeCurrent: viewSizeQuery,
      itemsPerPage,
      queryParamsLoading,
      setTilesViewSize
    }
  },
  computed: {
    ...mapState('Files', ['areHiddenFilesShown', 'areFileExtensionsShown']),

    viewOptionsButtonLabel() {
      return this.$gettext('Display customization options of the files list')
    },
    resizeTilesLabel() {
      return this.$gettext('Tile size')
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
  &:not(:last-child) {
    margin-bottom: var(--oc-space-medium);
  }

  & > * {
    display: flex;
    justify-content: space-between;
  }

  & + & {
    margin-top: var(--oc-space-small);
  }
}

.oc-range {
  -webkit-appearance: none;
  -webkit-transition: 0.2s;
  border-radius: 0.3rem;
  background: var(--oc-color-border);
  height: 0.5rem;
  opacity: 0.7;
  outline: none;
  transition: opacity 0.2s;
  width: 100%;
  max-width: 50%;

  &:hover {
    opacity: 1;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    background: var(--oc-color-swatch-primary-default);
    border-radius: 50%;
    cursor: pointer;
    height: 1rem;
    width: 1rem;
  }

  &::-moz-range-thumb {
    background: var(--oc-color-swatch-primary-default);
    border-radius: 50%;
    cursor: pointer;
    height: 1rem;
    width: 1rem;
  }
}
</style>

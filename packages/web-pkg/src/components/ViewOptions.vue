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
        <oc-icon
          :name="viewMode.icon.name"
          :fill-type="viewMode.icon.fillType"
          size="small"
          variation="inherit"
        />
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
            :selected="queryItemAsString(itemsPerPageCurrent)"
            data-testid="files-pagination-size"
            :label="$gettext('Items per page')"
            :options="paginationOptions"
            class="files-pagination-size"
            @change="setItemsPerPage"
          />
        </li>
        <li
          v-if="viewModes.includes(ViewModeConstants.tilesView)"
          class="files-view-options-list-item oc-visible@s oc-flex oc-flex-between oc-flex-middle"
        >
          <label for="tiles-size-slider" v-text="$gettext('Tile size')" />
          <input
            id="tiles-size-slider"
            v-model="viewSizeCurrent"
            type="range"
            min="1"
            max="6"
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
import { useGettext } from 'vue3-gettext'
import {
  queryItemAsString,
  useRoute,
  useRouteQuery,
  useRouteQueryPersisted,
  useRouter,
  PaginationConstants,
  ViewModeConstants,
  useRouteName
} from '../composables'
import { ViewMode } from '../ui/types'

export default defineComponent({
  props: {
    hasHiddenFiles: { type: Boolean, default: true },
    hasFileExtensions: { type: Boolean, default: true },
    hasPagination: { type: Boolean, default: true },
    paginationOptions: {
      type: Array as PropType<string[]>,
      default: () => PaginationConstants.options
    },
    perPageQueryName: {
      type: String,
      default: () => PaginationConstants.perPageQueryName
    },
    perPageDefault: {
      type: String,
      default: () => PaginationConstants.perPageDefault
    },
    perPageStoragePrefix: {
      type: String,
      required: true
    },
    viewModeDefault: {
      type: String,
      required: false,
      default: () => ViewModeConstants.defaultModeName
    },
    viewModes: {
      type: Array as PropType<ViewMode[]>,
      default: () => []
    }
  },
  setup(props) {
    const router = useRouter()
    const currentRoute = useRoute()
    const { $gettext } = useGettext()

    const queryParamsLoading = ref(false)

    const currentPageQuery = useRouteQuery('page')
    const currentPage = computed(() => {
      if (!unref(currentPageQuery)) {
        return 1
      }
      return parseInt(queryItemAsString(unref(currentPageQuery)))
    })
    const itemsPerPageQuery = useRouteQueryPersisted({
      name: props.perPageQueryName,
      defaultValue: props.perPageDefault,
      storagePrefix: props.perPageStoragePrefix
    })

    const routeName = useRouteName()
    const viewModeQuery = useRouteQueryPersisted({
      name: `${unref(routeName)}-${ViewModeConstants.queryName}`,
      defaultValue: props.viewModeDefault
    })

    const viewSizeQuery = useRouteQueryPersisted({
      name: ViewModeConstants.tilesSizeQueryName,
      defaultValue: ViewModeConstants.tilesSizeDefault.toString()
    })

    const setTilesViewSize = () => {
      const rootStyle = (document.querySelector(':root') as HTMLElement).style
      const currentSize = rootStyle.getPropertyValue('--oc-size-tiles-resize-step')
      const newSize = `${(unref(viewSizeQuery) as any) * 10}rem`
      const newSize2 = `${((unref(viewSizeQuery) as any) * 1) / 10}fr`
      if (!currentSize || currentSize !== newSize) {
        rootStyle.setProperty(`--oc-size-tiles-resize-step`, newSize)
        rootStyle.setProperty(`--oc-size-tiles-resize-step2`, newSize2)
      }
    }

    const setItemsPerPage = (itemsPerPage: string) => {
      return router.replace({
        query: {
          ...unref(currentRoute).query,
          [props.perPageQueryName]: itemsPerPage,
          ...(unref(currentPage) > 1 && { page: '1' })
        }
      })
    }

    const setViewMode = (mode: ViewMode) => {
      viewModeQuery.value = mode.name
    }

    watch(
      [itemsPerPageQuery, viewModeQuery, viewSizeQuery],
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
      itemsPerPageCurrent: itemsPerPageQuery,
      queryParamsLoading,
      queryItemAsString,
      setTilesViewSize,
      setItemsPerPage,
      setViewMode,
      viewOptionsButtonLabel: $gettext('Display customization options of the files list')
    }
  },
  computed: {
    ...mapState('Files', ['areHiddenFilesShown', 'areFileExtensionsShown']),

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

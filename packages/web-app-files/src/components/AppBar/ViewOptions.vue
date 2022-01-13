<template>
  <div>
    <oc-button
      id="files-view-options-btn"
      key="files-view-options-btn"
      v-oc-tooltip="viewOptionsButtonLabel"
      data-testid="files-view-options-btn"
      :aria-label="viewOptionsButtonLabel"
      variation="passive"
      appearance="raw"
      class="oc-py-s oc-mb-xs"
    >
      <oc-icon name="settings-3" fill-type="line" />
    </oc-button>
    <oc-button
      id="files-toggle-sidebar"
      v-oc-tooltip="toggleSidebarButtonLabel"
      :aria-label="toggleSidebarButtonLabel"
      variation="passive"
      appearance="raw"
      class="oc-ml-s oc-py-s oc-mb-xs"
      @click.stop="toggleSidebar"
    >
      <oc-icon name="side-bar-right" :fill-type="toggleSidebarButtonIconFillType" />
    </oc-button>
    <oc-drop
      drop-id="files-view-options-drop"
      toggle="#files-view-options-btn"
      mode="click"
      class="oc-width-auto"
      padding-size="small"
    >
      <oc-list>
        <li class="files-view-options-list-item">
          <oc-switch
            v-model="hiddenFilesShownModel"
            data-testid="files-switch-hidden-files"
            :label="$gettext('Show hidden files')"
          />
        </li>
        <li class="files-view-options-list-item">
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
import { mapMutations, mapState, mapActions } from 'vuex'
import { watch } from '@vue/composition-api'
import { useRouteQuery, useDefaults } from '../../composables'

export default {
  setup() {
    const { pagination: paginationDefaults } = useDefaults()
    const itemsPerPage = useRouteQuery('items-per-page', paginationDefaults.perPage.value)
    watch(itemsPerPage, (v) => {
      paginationDefaults.perPage.value = v
    })

    return {
      itemsPerPage
    }
  },
  computed: {
    ...mapState('Files', ['areHiddenFilesShown']),
    ...mapState('Files/sidebar', { sidebarClosed: 'closed' }),

    viewOptionsButtonLabel() {
      return this.$gettext('Display customization options of the files list')
    },

    toggleSidebarButtonLabel() {
      if (this.sidebarClosed) return this.$gettext('Open sidebar to view details')
      return this.$gettext('Close sidebar to hide details')
    },

    toggleSidebarButtonIconFillType() {
      return this.sidebarClosed ? 'line' : 'fill'
    },

    hiddenFilesShownModel: {
      get() {
        return this.areHiddenFilesShown
      },

      set(value) {
        this.SET_HIDDEN_FILES_VISIBILITY(value)
      }
    }
  },
  methods: {
    ...mapMutations('Files', ['SET_HIDDEN_FILES_VISIBILITY']),
    ...mapActions('Files/sidebar', { toggleSidebar: 'toggle' })
  }
}
</script>

<style lang="scss" scoped>
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

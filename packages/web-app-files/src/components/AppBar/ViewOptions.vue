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
      <oc-icon name="tune" />
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
      <oc-icon :name="toggleIcon" />
    </oc-button>
    <oc-drop
      drop-id="files-view-options-drop"
      toggle="#files-view-options-btn"
      mode="click"
      class="uk-width-auto"
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
            v-model="itemsPerPageModel"
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

export default {
  computed: {
    ...mapState('Files', ['areHiddenFilesShown']),
    ...mapState('Files/sidebar', { sidebarClosed: 'closed' }),
    ...mapState('Files/pagination', ['itemsPerPage']),

    viewOptionsButtonLabel() {
      return this.$gettext('Display customization options of the files list')
    },

    toggleSidebarButtonLabel() {
      if (this.sidebarClosed) return this.$gettext('Open sidebar to view details')
      return this.$gettext('Close sidebar to hide details')
    },

    toggleIcon() {
      return this.sidebarClosed ? 'chevron_double_left' : 'chevron_double_right'
    },

    hiddenFilesShownModel: {
      get() {
        return this.areHiddenFilesShown
      },

      set(value) {
        this.SET_HIDDEN_FILES_VISIBILITY(value)
      }
    },

    itemsPerPageModel: {
      get() {
        return this.itemsPerPage
      },

      set(value) {
        this.updateQuery(value)
      }
    }
  },

  watch: {
    $route: {
      handler(route) {
        if (Object.prototype.hasOwnProperty.call(route.query, 'items-per-page')) {
          this.SET_ITEMS_PER_PAGE(route.query['items-per-page'])

          return
        }

        this.updateQuery()
      },
      immediate: true
    }
  },
  methods: {
    ...mapMutations('Files', ['SET_HIDDEN_FILES_VISIBILITY']),
    ...mapActions('Files/sidebar', { toggleSidebar: 'toggle' }),
    ...mapMutations('Files/pagination', ['SET_ITEMS_PER_PAGE']),

    updateQuery(limit = this.itemsPerPageModel) {
      const query = { ...this.$route.query, 'items-per-page': limit }

      this.SET_ITEMS_PER_PAGE(limit)
      this.$router.replace({ query }).catch(() => {})
    }
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

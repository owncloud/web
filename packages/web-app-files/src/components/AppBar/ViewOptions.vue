<template>
  <div>
    <oc-button
      id="files-view-options-btn"
      key="files-view-options-btn"
      data-testid="files-view-options-btn"
      :aria-label="viewButtonAriaLabel"
      variation="passive"
      appearance="raw"
      size="small"
      gap-size="xsmall"
    >
      <oc-icon name="tune" size="medium" />
    </oc-button>
    <oc-button
      :aria-label="toggleSidebarAriaLabel"
      variation="passive"
      appearance="raw"
      size="small"
      gap-size="xsmall"
      class="oc-ml-s"
      @click.stop="toggleSidebar"
    >
      <oc-icon :name="toggleIcon" size="medium" />
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
            v-model="pageItemsLimit"
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
import { bus } from 'web-pkg/src/instance'

export default {
  data() {
    return {
      sidebarClosed: true
    }
  },
  computed: {
    ...mapState('Files', ['areHiddenFilesShown', 'filesPageLimit']),

    viewButtonAriaLabel() {
      return this.$gettext('Display customization options of the files list')
    },

    toggleSidebarAriaLabel() {
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

    pageItemsLimit: {
      get() {
        return this.filesPageLimit
      },

      set(value) {
        this.updateQuery(value)
      }
    }
  },

  watch: {
    $route: {
      handler(route) {
        if (Object.prototype.hasOwnProperty.call(route.query, 'items-limit')) {
          this.SET_FILES_PAGE_LIMIT(route.query['items-limit'])

          return
        }

        this.updateQuery()
      },
      immediate: true
    }
  },
  mounted() {
    bus.on('app.files.sidebar.close', () => {
      this.sidebarClosed = true
    })
    bus.on('app.files.sidebar.show', () => {
      this.sidebarClosed = false
    })
  },
  methods: {
    ...mapMutations('Files', ['SET_HIDDEN_FILES_VISIBILITY', 'SET_FILES_PAGE_LIMIT']),

    updateQuery(limit = this.pageItemsLimit) {
      const query = { ...this.$route.query, 'items-limit': limit }

      this.SET_FILES_PAGE_LIMIT(limit)
      this.$router.replace({ query }).catch(() => {})
    },

    toggleSidebar() {
      bus.emit('app.files.sidebar.toggle')
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

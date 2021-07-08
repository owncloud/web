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
      <oc-icon name="tune" size="small" />
      <translate>View</translate>
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

export default {
  computed: {
    ...mapState('Files', ['areHiddenFilesShown', 'filesPageLimit']),

    viewButtonAriaLabel() {
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

  methods: {
    ...mapMutations('Files', ['SET_HIDDEN_FILES_VISIBILITY', 'SET_FILES_PAGE_LIMIT']),

    updateQuery(limit = this.pageItemsLimit) {
      const query = { ...this.$route.query, 'items-limit': limit }

      this.SET_FILES_PAGE_LIMIT(limit)
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

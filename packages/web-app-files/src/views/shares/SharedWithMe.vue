<template>
  <div class="oc-flex">
    <files-view-wrapper class="oc-flex-column">
      <app-bar
        :has-shares-navigation="true"
        :has-bulk-actions="true"
        :side-bar-open="sideBarOpen"
      />
      <app-loading-spinner v-if="areResourcesLoading" />
      <template v-else>
        <h2 class="oc-px-m oc-py-s">
          {{ showHiddenShares ? hiddenTitle : acceptedTitle }}
          <span class="oc-text-medium"
            >({{ showHiddenShares ? hiddenItems.length : acceptedItems.length }})</span
          >
          <oc-button
            id="files-shared-with-me-toggle-view-mode"
            class="oc-ml-m"
            @click.stop="switchHiddenShares"
          >
            {{ switchHiddenSharesLabel }}
          </oc-button>
        </h2>

        <shared-with-me-section
          v-if="!showHiddenShares"
          id="files-shared-with-me-accepted-section"
          :display-thumbnails="displayThumbnails"
          :file-list-header-y="fileListHeaderY"
          :empty-message="emptyMessage"
          :items="acceptedItems"
          :resource-clickable="true"
          :share-status="ShareStatus.accepted"
          :side-bar-open="sideBarOpen"
          :sort-by="acceptedSortBy"
          :sort-dir="acceptedSortDir"
          :sort-handler="acceptedHandleSort"
          :title="acceptedTitle"
          :grouping-settings="groupingSettings"
        />

        <shared-with-me-section
          v-else
          id="files-shared-with-me-hidden-section"
          :title="hiddenTitle"
          :empty-message="hiddenEmptyMessage"
          :file-list-header-y="fileListHeaderY"
          :items="hiddenItems"
          :side-bar-open="sideBarOpen"
          :share-status="ShareStatus.declined"
          :sort-by="hiddenSortBy"
          :sort-dir="hiddenSortDir"
          :sort-handler="hiddenHandleSort"
          :display-thumbnails="false"
          :resource-clickable="true"
          :grouping-settings="groupingSettings"
        />
      </template>
    </files-view-wrapper>
    <side-bar :open="sideBarOpen" :active-panel="sideBarActivePanel" />
  </div>
</template>

<script lang="ts">
import { mapGetters } from 'vuex'
import { useSort, useResourcesViewDefaults } from '../../composables'

import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import AppBar from '../../components/AppBar/AppBar.vue'
import SharedWithMeSection from '../../components/Shares/SharedWithMeSection.vue'
import { ShareStatus } from 'web-client/src/helpers/share'
import { computed, defineComponent, unref } from '@vue/composition-api'
import { Resource } from 'web-client'
import SideBar from '../../components/SideBar/SideBar.vue'
import FilesViewWrapper from '../../components/FilesViewWrapper.vue'

export default defineComponent({
  components: {
    FilesViewWrapper,
    AppBar,
    AppLoadingSpinner,
    SharedWithMeSection,
    SideBar
  },

  setup() {
    const {
      areResourcesLoading,
      fields,
      fileListHeaderY,
      loadResourcesTask,
      selectedResources,
      selectedResourcesIds,
      sideBarActivePanel,
      sideBarOpen,
      storeItems
    } = useResourcesViewDefaults<Resource, any, any[]>()

    // accepted shares
    const accepted = computed(() =>
      unref(storeItems).filter(
        (item) => item.status === ShareStatus.accepted || item.status === ShareStatus.pending
      )
    )
    const {
      sortBy: acceptedSortBy,
      sortDir: acceptedSortDir,
      items: acceptedItems,
      handleSort: acceptedHandleSort
    } = useSort({
      items: accepted,
      fields,
      sortByQueryName: 'accepted-sort-by',
      sortDirQueryName: 'accepted-sort-dir'
    })

    // hidden shares
    const hidden = computed(() =>
      unref(storeItems).filter((item) => item.status === ShareStatus.declined)
    )
    const {
      sortBy: hiddenSortBy,
      sortDir: hiddenSortDir,
      items: hiddenItems,
      handleSort: hiddenHandleSort
    } = useSort({
      items: hidden,
      fields,
      sortByQueryName: 'hidden-sort-by',
      sortDirQueryName: 'hidden-sort-dir'
    })

    return {
      // defaults
      loadResourcesTask,
      areResourcesLoading,
      selectedResources,
      selectedResourcesIds,
      fileListHeaderY,
      sideBarOpen,
      sideBarActivePanel,

      acceptedHandleSort,
      acceptedSortBy,
      acceptedSortDir,
      acceptedItems,

      hiddenHandleSort,
      hiddenSortBy,
      hiddenSortDir,
      hiddenItems
    }
  },

  data: () => ({
    ShareStatus,
    showHiddenShares: false
  }),

  computed: {
    ...mapGetters(['configuration']),

    groupingSettings() {
      const that = this
      return {
        groupingBy: localStorage.getItem('grouping-shared-with-me') || 'Shared on',
        showGroupingOptions: true,
        groupingFunctions: {
          'Name alphabetically': function (row) {
            localStorage.setItem('grouping-shared-with-me', 'Name alphabetically')
            if (!isNaN(row.name.charAt(0))) return '#'
            if (row.name.charAt(0) === '.') return row.name.charAt(1).toLowerCase()
            return row.name.charAt(0).toLowerCase()
          },
          'Shared on': function (row) {
            localStorage.setItem('grouping-shared-with-me', 'Shared on')
            const recently = Date.now() - 604800000
            const lastMonth = Date.now() - 2592000000
            if (Date.parse(row.sdate) < lastMonth) return 'Older'
            if (Date.parse(row.sdate) >= recently) return 'Recently'
            else return 'Last month'
          },
          'Share owner': function (row) {
            localStorage.setItem('grouping-shared-with-me', 'Share owner')
            return row.owner[0].displayName
          },
          None: function () {
            localStorage.setItem('grouping-shared-with-me', 'None')
          }
        },
        sortGroups: {
          'Name alphabetically': function (groups) {
            // sort in alphabetical order by group name
            const sortedGroups = groups.sort(function (a, b) {
              if (a.name < b.name) {
                return -1
              }
              if (a.name > b.name) {
                return 1
              }
              return 0
            })
            // if sorting is done by name, reverse groups depending on asc/desc
            if (that.sharesSortBy === 'name' && that.sharesSortDir === 'desc')
              sortedGroups.reverse()
            return sortedGroups
          },
          'Shared on': function (groups) {
            // sort in order: 1-Recently, 2-Last month, 3-Older
            const sortedGroups = []
            const options = ['Recently', 'Last month', 'Older']
            for (const o of options) {
              const found = groups.find((el) => el.name.toLowerCase() === o.toLowerCase())
              if (found) sortedGroups.push(found)
            }
            // if sorting is done by sdate, reverse groups depending on asc/desc
            if (that.sharesSortBy === 'sdate' && that.sharesSortDir === 'asc')
              sortedGroups.reverse()
            return sortedGroups
          },
          'Share owner': function (groups) {
            // sort in alphabetical order by group name
            const sortedGroups = groups.sort(function (a, b) {
              if (a.name < b.name) {
                return -1
              }
              if (a.name > b.name) {
                return 1
              }
              return 0
            })
            // if sorting is done by owner, reverse groups depending on asc/desc
            if (that.sharesSortBy === 'owner' && that.sharesSortDir === 'desc')
              sortedGroups.reverse()
            return sortedGroups
          }
        }
      }
    },

    pendingTitle() {
      return this.$gettext('Pending shares')
    },
    acceptedTitle() {
      return this.$gettext('Shared with me')
    },
    emptyMessage() {
      return this.$gettext("You are not collaborating on other people's resources.")
    },

    hiddenTitle() {
      return this.$gettext('Hidden shares')
    },
    hiddenEmptyMessage() {
      return this.$gettext("You don't have any previously hidden shares.")
    },
    displayThumbnails() {
      return !this.configuration?.options?.disablePreviews
    },
    switchHiddenSharesLabel() {
      return this.showHiddenShares
        ? this.$gettext('Show shares')
        : this.$gettext('Show hidden shares')
    }
  },

  created() {
    this.loadResourcesTask.perform()
  },
  methods: {
    switchHiddenShares() {
      this.showHiddenShares = !this.showHiddenShares
    }
  }
})
</script>

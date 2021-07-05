<template>
  <oc-app-side-bar
    :key="highlightedFile.id"
    v-click-outside="onClickOutside"
    class="files-sidebar oc-px-s oc-border-l"
    :disable-action="false"
    :close-button-label="$gettext('Close file sidebar')"
    @close="close()"
  >
    <template v-if="highlightedFile" slot="title">
      <div class="uk-inline">
        <oc-icon :name="highlightedFile.icon" size="xlarge" />
      </div>
      <div class="uk-inline">
        <div class="uk-flex uk-flex-middle">
          <h2
            id="files-sidebar-item-name"
            class="oc-text-initial oc-mr-s oc-text-bold uk-margin-remove"
            tabindex="-1"
            v-text="highlightedFile.name"
          />
        </div>
        <div class="uk-flex uk-flex-middle">
          <oc-button
            v-if="!publicPage() && isFavoritesEnabled"
            id="files-sidebar-star-icon"
            :aria-label="
              highlightedFile.starred
                ? $gettext('Click to remove this file from your favorites')
                : $gettext('Click to mark this file as favorite')
            "
            appearance="raw"
            class="oc-mr-xs"
            @click.native.stop="toggleFileFavorite(highlightedFile)"
          >
            <oc-icon :class="favoriteIconClass" name="star" />
          </oc-button>
          <template v-if="highlightedFile.size > -1">
            {{ getResourceSize(highlightedFile.size) }},
          </template>
          {{ modificationTime }}
        </div>
      </div>
    </template>
    <template slot="content">
      <oc-accordion
        v-if="isContentDisplayed"
        key="sidebar-accordions"
        class="oc-mt-m"
        :expand-first="true"
        :expanded-id="expandedAccordionId"
        mode="data"
        @expand="expandAccordion"
        @collapse="expandAccordion(null)"
      >
        <oc-accordion-item
          v-for="accordion in accordions"
          :id="buildAppSidebarId(accordion.app)"
          :key="accordion.app"
          :title="accordion.component.title($gettext)"
          :icon="accordion.icon"
        >
          <component :is="accordion.component" class="oc-px" />
        </oc-accordion-item>
      </oc-accordion>
      <p
        v-else
        key="sidebar-warning-message"
        class="oc-mt"
        v-text="sidebarAccordionsWarningMessage"
      />
    </template>
  </oc-app-side-bar>
</template>

<script>
import Mixins from '../../mixins'
import MixinResources from '../../mixins/resources'
import MixinRoutes from '../../mixins/routes'
import { mapActions, mapGetters, mapState, mapMutations } from 'vuex'

import FileActions from './Actions/FileActions.vue'

export default {
  components: {
    FileActions
  },
  mixins: [Mixins, MixinResources, MixinRoutes],
  computed: {
    ...mapGetters(['fileSideBars', 'capabilities']),
    ...mapGetters('Files', ['highlightedFile']),
    ...mapState('Files', ['appSidebarExpandedAccordion']),

    accordions() {
      const accordions = [
        {
          app: 'sidebar-actions-item',
          component: FileActions,
          icon: 'slideshow'
        }
      ]

      if (this.isTrashbinRoute) {
        return accordions
      }

      return accordions.concat(
        this.fileSideBars.filter(
          b => b.enabled === undefined || b.enabled(this.capabilities, this.highlightedFile)
        )
      )
    },

    isFavoritesEnabled() {
      return (
        this.capabilities.files &&
        this.capabilities.files.favorites &&
        this.isContentDisplayed &&
        !this.isAnySharedWithRoute &&
        !this.isTrashbinRoute
      )
    },

    expandedAccordionId() {
      return this.buildAppSidebarId(this.appSidebarExpandedAccordion)
    },

    modificationTime() {
      if (this.isTrashbinRoute) {
        return this.formDateFromNow(this.highlightedFile.ddate, 'RFC')
      }

      return this.formDateFromNow(this.highlightedFile.mdate, 'Http')
    },

    isShareAccepted() {
      return this.highlightedFile.status === 0
    },

    isContentDisplayed() {
      if (this.isSharedWithMeRoute) {
        return this.isShareAccepted
      }

      return true
    },

    sidebarAccordionsWarningMessage() {
      if (!this.isShareAccepted) {
        return this.$gettext('Please, accept this share first to display available actions')
      }

      return null
    },

    favoriteIconClass() {
      return this.highlightedFile.starred ? 'oc-star-shining' : 'oc-star-dimm'
    }
  },

  watch: {
    highlightedFile: function() {
      if (this.expandedAccordionId === null) {
        this.expandActionsAccordion()
      }
      this.$nextTick(() => this.$emit('fileChanged', this, 'fileChanged'))
    }
  },

  beforeDestroy() {
    this.SET_APP_SIDEBAR_EXPANDED_ACCORDION(null)
  },

  mounted() {
    if (this.expandedAccordionId === null) {
      this.expandActionsAccordion()
    }
  },

  methods: {
    ...mapActions('Files', ['markFavorite']),
    ...mapMutations('Files', ['SET_APP_SIDEBAR_EXPANDED_ACCORDION']),

    close() {
      this.$emit('reset')
    },

    toggleFileFavorite(file) {
      this.markFavorite({
        client: this.$client,
        file: file
      })
    },

    buildAppSidebarId(accordion) {
      if (accordion) {
        return `app-sidebar-${accordion}`
      }
      return null
    },

    expandAccordion(accordion) {
      this.SET_APP_SIDEBAR_EXPANDED_ACCORDION(
        accordion ? accordion.replace('app-sidebar-', '') : null
      )
    },

    expandActionsAccordion() {
      this.SET_APP_SIDEBAR_EXPANDED_ACCORDION('sidebar-actions-item')
    },

    onClickOutside(event) {
      /*
       * We need to go for this opt-out solution because under circumstances a modal will be rendered,
       * for example if we click rename, clicking in this modal would otherwise falsy close the sidebar.
       */

      if (
        document.querySelector('.files-topbar').contains(event.target) ||
        document.querySelector('.oc-topbar').contains(event.target) ||
        document.querySelector('.oc-app-navigation').contains(event.target) ||
        event.target.id === 'files-view'
      ) {
        this.close()
      }
    }
  }
}
</script>

<style lang="scss">
.files-sidebar {
  background-color: var(--oc-color-background-default);
  z-index: 1;
}

.oc-star {
  &-shining svg {
    fill: #ffba0a !important;
    path:not([fill='none']) {
      stroke: var(--oc-color-swatch-passive-default);
    }
  }
}
</style>

<template>
  <oc-app-side-bar
    :key="highlightedFile.id"
    class="files-sidebar oc-p-s oc-border-l"
    :disable-action="false"
    @close="close()"
  >
    <template v-if="highlightedFile" slot="title">
      <div class="uk-inline">
        <oc-icon :name="highlightedFile.icon" size="xlarge" />
      </div>
      <div class="uk-inline">
        <div class="uk-flex uk-flex-middle">
          <span
            id="files-sidebar-item-name"
            class="oc-mr-s oc-text-bold"
            v-text="highlightedFile.name"
          />
        </div>
        <div class="uk-flex uk-flex-middle">
          <oc-icon
            v-if="!publicPage() && isFavoritesEnabled"
            id="files-sidebar-star-icon"
            :class="['uk-inline', 'oc-mr-xs', favoriteIconClass]"
            name="star"
            :accessible-label="
              highlightedFile.starred
                ? $gettext('File is marked as favorite')
                : $gettext('File is not marked as favorite')
            "
            @click.native.stop="toggleFileFavorite(highlightedFile)"
          />
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
import Mixins from '../mixins'
import MixinResources from '../mixins/resources'
import MixinRoutes from '../mixins/routes'
import { mapActions, mapGetters, mapState, mapMutations } from 'vuex'

import ActionsAccordion from './Sidebar/ActionsAccordion.vue'

export default {
  components: {
    ActionsAccordion
  },
  mixins: [Mixins, MixinResources, MixinRoutes],
  computed: {
    ...mapGetters(['fileSideBars', 'capabilities']),
    ...mapGetters('Files', ['highlightedFile']),
    ...mapState('Files', ['appSidebarExpandedAccordion']),

    accordions() {
      const accordions = [
        {
          app: 'files-actions',
          component: ActionsAccordion,
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
        return this.formDateFromNow(this.highlightedFile.deleteTimestamp)
      }

      return this.formDateFromNow(this.highlightedFile.mdate)
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
      this.SET_APP_SIDEBAR_EXPANDED_ACCORDION('files-actions')
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
  }
}
</style>

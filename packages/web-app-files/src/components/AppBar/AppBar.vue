<template>
  <div id="files-app-bar">
    <oc-hidden-announcer :announcement="selectedResourcesAnnouncement" level="polite" />
    <div class="files-topbar oc-py-s">
      <h1 class="oc-invisible-sr" v-text="pageTitle" />
      <div class="oc-flex oc-flex-between">
        <oc-breadcrumb
          v-if="breadcrumbs.length"
          id="files-breadcrumb"
          data-testid="files-breadcrumbs"
          class="oc-flex oc-flex-middle"
          context-menu-padding="small"
          :items="breadcrumbs"
        >
          <template v-if="breadcrumbsContextActionsDisplayed" #contextMenu>
            <context-actions :items="breadcrumbsContextActionsItems" />
          </template>
        </oc-breadcrumb>
        <shares-navigation v-if="hasSharesNavigation" />
        <view-options />
      </div>
      <div class="files-app-bar-actions">
        <div class="oc-flex-1 oc-flex oc-flex-start" style="gap: 15px">
          <slot v-if="selectedFiles.length === 0" name="actions" />
          <size-info v-if="hasBulkActions && selectedFiles.length > 0" class="oc-visible@l" />
          <batch-actions v-if="hasBulkActions && selectedFiles.length > 0" />
        </div>
      </div>
      <slot name="static" />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState, mapMutations } from 'vuex'

import Mixins from '../../mixins'
import MixinFileActions from '../../mixins/fileActions'
import { isLocationSpacesActive } from '../../router'
import { useActiveLocation } from '../../composables'

import BatchActions from './SelectedResources/BatchActions.vue'
import ContextActions from '../FilesList/ContextActions.vue'
import SharesNavigation from './SharesNavigation.vue'
import SizeInfo from './SelectedResources/SizeInfo.vue'
import ViewOptions from './ViewOptions.vue'

export default {
  components: {
    BatchActions,
    ContextActions,
    SharesNavigation,
    SizeInfo,
    ViewOptions
  },
  mixins: [Mixins, MixinFileActions],
  props: {
    breadcrumbs: { type: Array, default: () => [] },
    breadcrumbsContextActionsDisplayed: { type: Boolean, default: false },
    breadcrumbsContextActionsItems: { type: Array, default: () => [] },
    hasBulkActions: { type: Boolean, default: false },
    hasSharesNavigation: { type: Boolean, default: false }
  },
  setup() {
    return {
      isPersonalLocation: useActiveLocation(isLocationSpacesActive, 'files-spaces-personal-home'),
      isSpacesProjectLocation: useActiveLocation(isLocationSpacesActive, 'files-spaces-project')
    }
  },
  data: () => ({
    newFileAction: null,
    path: '',
    fileFolderCreationLoading: false
  }),
  computed: {
    ...mapGetters(['getToken', 'capabilities', 'configuration', 'newFileHandlers', 'user']),
    ...mapGetters('Files', ['files', 'currentFolder', 'selectedFiles', 'publicLinkPassword']),
    ...mapState('Files', ['areHiddenFilesShown']),

    // we should generalize the usage of pageTitle throughout the project next
    pageTitle() {
      const title = this.$route.meta.title
      return this.$gettext(title)
    },
    areDefaultActionsVisible() {
      return this.selectedFiles.length < 1
    },

    selectedResourcesAnnouncement() {
      if (this.selectedFiles.length === 0) {
        return this.$gettext('No items selected.')
      }
      const translated = this.$ngettext(
        '%{ amount } item selected. Actions are available above the table.',
        '%{ amount } items selected. Actions are available above the table.',
        this.selectedFiles.length
      )
      return this.$gettextInterpolate(translated, { amount: this.selectedFiles.length })
    }
  },

  created() {
    // Storage returns a string so we need to convert it into a boolean
    const areHiddenFilesShown = window.localStorage.getItem('oc_hiddenFilesShown') || 'false'
    const areHiddenFilesShownBoolean = areHiddenFilesShown === 'true'

    if (areHiddenFilesShownBoolean !== this.areHiddenFilesShown) {
      this.SET_HIDDEN_FILES_VISIBILITY(areHiddenFilesShownBoolean)
    }
  },

  methods: {
    ...mapMutations('Files', ['SET_HIDDEN_FILES_VISIBILITY'])
  }
}
</script>

<style lang="scss" scoped>
#files-app-bar {
  background-color: var(--oc-color-background-default);
  box-sizing: border-box;
  z-index: 2;
  padding: 0 var(--oc-space-medium);
  border-top-right-radius: 15px;

  .files-app-bar-actions {
    align-items: center;
    display: flex;
    gap: var(--oc-space-small);
    justify-content: flex-end;
    min-height: 3rem;
  }

  #files-breadcrumb {
    min-height: 2rem;
  }
}
</style>

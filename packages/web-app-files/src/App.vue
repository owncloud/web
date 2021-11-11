<template>
  <main id="files" class="uk-flex uk-height-1-1">
    <!-- <transition :name="appNavigationAnimation">
      <focus-trap v-if="isSidebarVisible" :active="isSidebarFixed && appNavigationVisible"> -->
        <oc-sidebar-nav

          id="web-nav-sidebar"
          class="oc-app-navigation"
          :accessible-label-header="$gettext('Sidebar header')"
          :accessible-label-nav="$gettext('Sidebar navigation menu')"
          :accessible-label-footer="$gettext('Sidebar footer')"
          :class="sidebarClasses"
        >
          <template #header>
            <div class="uk-text-center">
              <oc-button
                v-if="isSidebarFixed"
                variation="inverse"
                appearance="raw"
                class="web-sidebar-btn-close"
                :aria-label="$gettext('Close sidebar')"
                @click="toggleAppNavigationVisibility"
              >
                <oc-icon name="close" />
              </oc-button>
            </div>
          </template>
          <template #nav>
            <oc-list>
              <oc-sidebar-nav-item
                v-for="link in sidebarNavItems"
                :key="link.route.path"
                :active="link.active"
                :target="link.route.path"
                :icon="link.icon || link.iconMaterial"
              >
                {{ link.name }}
              </oc-sidebar-nav-item>
            </oc-list>
          </template>
          <template v-if="sidebar.sidebarFooterContentComponent" #footer>
            <component :is="sidebar.sidebarFooterContentComponent" />
          </template>
        </oc-sidebar-nav>
      <!-- </focus-trap>
    </transition> -->

    <div
      ref="filesListWrapper"
      tabindex="-1"
      class="files-list-wrapper uk-width-expand"
      @dragover="$_ocApp_dragOver"
    >
      <app-bar id="files-app-bar" />
      <progress-bar v-show="$_uploadProgressVisible" id="files-upload-progress" class="oc-p-s" />
      <router-view id="files-view" />
    </div>
    <side-bar
      v-if="!sidebarClosed"
      id="files-sidebar"
      ref="filesSidebar"
      tabindex="-1"
      class="uk-width-1-1 uk-width-1-3@m uk-width-1-4@xl"
      @beforeDestroy="focusSideBar"
      @mounted="focusSideBar"
      @fileChanged="focusSideBar"
    />
  </main>
</template>
<script>
import Mixins from './mixins'
import MixinRoutes from './mixins/routes'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import AppBar from './components/AppBar/AppBar.vue'
import ProgressBar from './components/Upload/ProgressBar.vue'
import SideBar from './components/SideBar/SideBar.vue'
import { FocusTrap } from 'focus-trap-vue'

export default {
  components: {
    AppBar,
    ProgressBar,
    SideBar,
    FocusTrap
  },
  mixins: [Mixins, MixinRoutes],
  data() {
    return {
      appNavigationVisible: false,
      createFolder: false,
      fileUploadName: '',
      fileUploadProgress: 0,
      upload: false,
      fileName: '',
      breadcrumbs: []
    }
  },
  computed: {
    ...mapState(['route', 'sidebar']),
    ...mapGetters([
      'capabilities',
      'getNavItemsByExtension'
    ]),

    ...mapGetters('Files', ['dropzone', 'inProgress']),
    ...mapState('Files/sidebar', { sidebarClosed: 'closed' }),

    $_uploadProgressVisible() {
      return this.inProgress.length > 0
    },
    showSidebar() {
      return !this.sidebarClosed
    },

    sidebarNavItems() {
      if (this.publicPage()) {
        return []
      }

      const items = this.getNavItemsByExtension(this.currentExtension)
      if (!items) {
        return []
      }

      items.filter((item) => {
        if (this.capabilities === undefined) {
          return false
        }

        if (item.enabled === undefined) {
          return true
        }

        return item.enabled(this.capabilities)
      })

      return items.map((item) => ({
        ...item,
        name: this.$gettext(item.name),
        active: this.$route.name === item.route.name
      }))
    },

    sidebarClasses() {
      if (this.appNavigationVisible) {
        return ''
      }

      return 'uk-visible@l'
    },

    isSidebarFixed() {
      return this.windowWidth <= 960
    },

    isSidebarVisible() {
      if (this.sidebarNavItems.length === 0) {
        return false
      }
      return this.windowWidth >= 900 || this.appNavigationVisible
    },

    appNavigationAnimation() {
      if (this.windowWidth > 1200) {
        return null
      }

      if (this.windowWidth > 960) {
        return 'push-right'
      }

      return 'fade'
    }
  },
  watch: {
    $route: {
      handler: function (to, from) {
        this.resetFileSelection()
        if (from?.name !== to.name) {
          this.closeSidebar()
        }
      }
    }
  },
  created() {
    this.$root.$on('upload-end', () => {
      this.delayForScreenreader(() => this.$refs.filesListWrapper.focus())
    })
  },

  beforeDestroy() {
    this.SET_SIDEBAR_FOOTER_CONTENT_COMPONENT(null)
  },

  methods: {
    ...mapActions('Files', ['dragOver', 'resetFileSelection']),
    ...mapActions('Files/sidebar', { closeSidebar: 'close' }),
    ...mapActions(['showMessage']),
    ...mapMutations(['SET_SIDEBAR_FOOTER_CONTENT_COMPONENT']),

    trace() {
      console.info('trace', arguments)
    },

    focusSideBar(component, event) {
      this.focus({
        from: document.activeElement,
        to: this.$refs.filesSidebar?.$el,
        revert: event === 'beforeDestroy'
      })
    },
    $_ocApp_dragOver(event) {
      const hasfileInEvent = (event.dataTransfer.types || []).some((e) => e === 'Files')
      this.dragOver(hasfileInEvent)
    }
  }
}
</script>

<style lang="scss" scoped>
main {
  height: 100%;
  max-height: 100%;
}

.files-list-wrapper {
  height: 100%;
  max-height: 100%;
  overflow-y: auto;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: max-content max-content 1fr;
  gap: 0 0;
  grid-template-areas:
    'header'
    'upload'
    'main';

  &:focus {
    outline: none;
  }
}

#files-sidebar {
  position: relative;
  overflow: hidden;
}

#files-app-bar {
  position: sticky;
  height: auto;
  z-index: 1;
  grid-area: header;
  top: 0;
}

#files-view {
  grid-area: main;
  z-index: 0;
}

#files-upload-progress {
  grid-area: upload;
}
</style>

<style lang="scss">
// Hide files table columns
.files-table {
  .oc-table-header-cell-mdate,
  .oc-table-data-cell-mdate,
  .oc-table-header-cell-sdate,
  .oc-table-data-cell-sdate,
  .oc-table-header-cell-ddate,
  .oc-table-data-cell-ddate,
  .oc-table-header-cell-size,
  .oc-table-data-cell-size,
  .oc-table-header-cell-sharedWith,
  .oc-table-data-cell-sharedWith,
  .oc-table-header-cell-owner,
  .oc-table-data-cell-owner,
  .oc-table-header-cell-status,
  .oc-table-data-cell-status {
    display: none;

    @media only screen and (min-width: 640px) {
      display: table-cell;
    }
  }

  .oc-table-header-cell-owner,
  .oc-table-data-cell-owner {
    display: none;

    @media only screen and (min-width: 960px) {
      display: table-cell;
    }
  }

  &-squashed {
    .oc-table-header-cell-mdate,
    .oc-table-data-cell-mdate,
    .oc-table-header-cell-sdate,
    .oc-table-data-cell-sdate,
    .oc-table-header-cell-ddate,
    .oc-table-data-cell-ddate,
    .oc-table-header-cell-size,
    .oc-table-data-cell-size,
    .oc-table-header-cell-sharedWith,
    .oc-table-data-cell-sharedWith,
    .oc-table-header-cell-owner,
    .oc-table-data-cell-owner,
    .oc-table-header-cell-status,
    .oc-table-data-cell-status {
      display: none;

      @media only screen and (min-width: 1600px) {
        display: table-cell;
      }
    }
  }
}

// .oc-app-navigation {
//   position: sticky;
//   top: 0;
//   z-index: 1;
// }


// .web-sidebar-btn-close {
//   position: absolute;
//   right: var(--oc-space-medium);
//   top: var(--oc-space-medium);
//   z-index: 3;
// }
// @media only screen and (max-width: 960px) {
//   #web-nav-sidebar {
//     height: 100%;
//     left: 0;
//     position: fixed;
//     top: 0;
//     width: 100%;
//     z-index: 3;
//   }
// }
</style>

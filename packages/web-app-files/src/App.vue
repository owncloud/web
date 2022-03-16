<template>
  <main id="files" class="oc-flex oc-height-1-1">
    <div
      ref="filesListWrapper"
      tabindex="-1"
      class="files-list-wrapper oc-width-expand"
      @dragover="$_ocApp_dragOver"
    >
      <app-bar v-if="!hideAppBar" id="files-app-bar" />
      <progress-bar v-show="$_uploadProgressVisible" id="files-upload-progress" class="oc-p-s" />
      <router-view id="files-view" />
    </div>
    <side-bar
      v-if="!sidebarClosed"
      id="files-sidebar"
      ref="filesSidebar"
      tabindex="-1"
      class="oc-width-1-1 oc-width-1-3@m oc-width-1-4@xl"
      @beforeDestroy="focusSideBar"
      @mounted="focusSideBar"
      @fileChanged="focusSideBar"
    />
  </main>
</template>
<script lang="ts">
import Mixins from './mixins'
import AppBar from './components/AppBar/AppBar.vue'
import ProgressBar from './components/Upload/ProgressBar.vue'
import SideBar from './components/SideBar/SideBar.vue'
import { Vue, Component, Watch } from 'vue-property-decorator'
import { mapActions, mapGetters, mapState } from 'vuex'

@Component({
  name: "BatchActions",
  extends: Vue,
  components: {
    AppBar,
    ProgressBar,
    SideBar
  },
  computed: {
    ...mapGetters('Files', ['dropzone', 'inProgress']),
    ...mapState('Files/sidebar', { sidebarClosed: 'closed' }),
  },
  methods: {
    ...mapActions('Files', ['dragOver', 'resetFileSelection']),
    ...mapActions('Files/sidebar', { closeSidebar: 'close' }),
    ...mapActions(['showMessage']),
  },
  mixins: [Mixins]
})
export default class BatchActions extends Vue{
  createFolder: boolean = false
  fileUploadName: string = ''
  fileUploadProgress: number = 0
  upload: boolean = false
  fileName: string = ''
  breadcrumbs: [] = []

  get $_uploadProgressVisible() {
    return this.inProgress.length > 0
  }
  get showSidebar() {
    return !this.sidebarClosed
  }
  get hideAppBar() {
    return this.$route.meta.hideAppBar === true
  }

  @Watch('$route')
  onPersonChanged2(to, from) {
    this.resetFileSelection()
    if (from?.name !== to.name) {
      this.closeSidebar()
    }
  }

  created() {
    this.$root.$on('upload-end', () => {
      this.delayForScreenreader(
        () => (this.$refs.filesListWrapper as HTMLElement).focus()
      )
    })
  }

  trace() {
    console.info('trace', arguments)
  }

  focusSideBar(component, event) {
    this.focus({
      from: document.activeElement,
      to: (this.$refs.filesSidebar as HTMLElement),
      revert: event === 'beforeDestroy'
    })
  }

  $_ocApp_dragOver(event) {
    const hasfileInEvent = (event.dataTransfer.types || []).some((e) => e === 'Files')
    this.dragOver(hasfileInEvent)
  }
}
</script>

<style lang="scss" scoped>
main {
  height: 100%;
  max-height: 100%;
}

.files-list-wrapper {
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
</style>

<template>
  <oc-grid gutter="small" child-width="1-1" class="uk-padding-small">
    <h1 class="files-move-selection-info uk-flex uk-text-lead">
      <translate
        :translate-n="resourcesCount"
        translate-plural="Selected %{ resourcesCount } resources to move into:"
        >Selected %{ resourcesCount } resource to move into:</translate
      >
      <oc-breadcrumb :items="breadcrumbs" class="uk-text-lead" />
    </h1>
    <file-list
      id="files-move-files-list"
      :file-data="activeFiles"
      :actions="[]"
      :is-action-enabled="() => false"
      :checkbox-enabled="false"
      :selectable-row="false"
    >
      <template #headerColumns>
        <div ref="headerNameColumn" class="uk-text-truncate uk-text-meta uk-width-expand">
          <sortable-column-header
            :aria-label="$gettext('Sort files by name')"
            :is-active="fileSortField === 'name'"
            :is-desc="fileSortDirectionDesc"
            @click="toggleSort('name')"
          >
            <translate translate-context="Name column in files table">Name</translate>
          </sortable-column-header>
        </div>
        <div
          :class="{ 'uk-visible@s': !_sidebarOpen, 'uk-hidden': _sidebarOpen }"
          class="uk-text-meta uk-width-small"
        >
          <sortable-column-header
            :aria-label="$gettext('Sort files by size')"
            :is-active="fileSortField === 'size'"
            :is-desc="fileSortDirectionDesc"
            class="uk-align-right"
            @click="toggleSort('size')"
          >
            <translate translate-context="Size column in files table">Size</translate>
          </sortable-column-header>
        </div>
        <div
          :class="{ 'uk-visible@s': !_sidebarOpen, 'uk-hidden': _sidebarOpen }"
          class="uk-text-nowrap uk-text-meta uk-width-small"
        >
          <sortable-column-header
            :aria-label="$gettext('Sort files by updated time')"
            :is-active="fileSortField === 'mdateMoment'"
            :is-desc="fileSortDirectionDesc"
            class="uk-align-right"
            @click="toggleSort('mdateMoment')"
          >
            <translate
              translate-context="Short column label in files table for the time at which a file was modified"
              >Updated</translate
            >
          </sortable-column-header>
        </div>
      </template>
      <template #rowColumns="{ item: rowItem, index }">
        <div :ref="index === 0 ? 'firstRowNameColumn' : null" class="uk-width-expand">
          <file-item
            :key="rowItem.viewId"
            :item="rowItem"
            @click.native="selectFolder(rowItem.path)"
          />
        </div>
        <div class="uk-text-meta uk-text-nowrap uk-width-small uk-text-right">
          {{ rowItem.size | fileSize }}
        </div>
        <div class="uk-text-meta uk-text-nowrap uk-width-small uk-text-right">
          {{ formDateFromNow(rowItem.mdate) }}
        </div>
      </template>
    </file-list>
  </oc-grid>
</template>

<script>
import { mapMutations, mapState, mapActions, mapGetters } from 'vuex'
import pathUtil from 'path'
import MixinsGeneral from '../../mixins'
import MoveSidebarMainContent from './MoveSidebarMainContent.vue'
import FileList from '../FileList.vue'
import FileItem from '../FileItem.vue'
import SortableColumnHeader from '../FilesLists/SortableColumnHeader.vue'

export default {
  name: 'LocationPickerMove',

  components: {
    FileList,
    FileItem,
    SortableColumnHeader
  },

  mixins: [MixinsGeneral],

  computed: {
    ...mapState('Files', ['selectedResourcesForMove', 'locationPickerTargetFolder']),
    ...mapGetters('Files', ['activeFiles', 'fileSortField', 'fileSortDirectionDesc']),

    resources() {
      const resources = JSON.parse(JSON.stringify(this.$route.query.resource))

      // In case there is only one resource, ensure that the return will still be an array
      if (typeof resources === 'string') {
        return [resources]
      }

      return resources
    },

    resourcesCount() {
      return this.resources.length
    },

    basePath() {
      return this.$route.path
    },

    resourcesQuery() {
      return '&resource=' + this.resources.join('&resource=')
    },

    breadcrumbs() {
      const target = JSON.parse(JSON.stringify(this.$route.query.target))
      const breadcrumbs = [
        {
          index: 0,
          text: this.$gettext('Home'),
          to: this.basePath + '?target' + this.resourcesQuery
        }
      ]

      if (target) {
        const items = target.split('/').filter(item => item !== '')

        for (let i = 0; i < items.length; i++) {
          const itemPath = encodeURIComponent(pathUtil.join.apply(null, items.slice(0, i + 1)))

          breadcrumbs.push({
            index: i + 1,
            text: items[i],
            to: this.createPath(itemPath)
          })
        }
      }

      delete breadcrumbs[breadcrumbs.length - 1].to

      return breadcrumbs
    }
  },

  watch: {
    $route: {
      handler: 'navigateToTarget',
      immediate: true
    }
  },

  created() {
    this.SET_MAIN_CONTENT_COMPONENT(MoveSidebarMainContent)
  },

  beforeDestroy() {
    this.SET_MAIN_CONTENT_COMPONENT(null)
  },

  methods: {
    ...mapMutations(['SET_MAIN_CONTENT_COMPONENT']),
    ...mapActions('Files', ['loadFolder']),

    navigateToTarget(target) {
      if (typeof target === 'object') {
        target = JSON.parse(JSON.stringify(this.$route.query.target))
      }

      this.loadFolder({
        client: this.$client,
        absolutePath: target || '/',
        $gettext: this.$gettext,
        routeName: this.$route.name,
        loadSharesTree: true
      })
    },

    createPath(target) {
      return this.basePath + '?target=' + target + this.resourcesQuery
    },

    selectFolder(folder) {
      this.navigateToTarget(folder)
      this.$router.push({ path: this.createPath(folder) })
    }
  }
}
</script>

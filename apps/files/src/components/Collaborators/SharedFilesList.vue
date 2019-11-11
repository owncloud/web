<template>
  <file-list :fileData="fileData" id="files-list" :loading="loadingFolder" :actions="actions" :compactMode="_sidebarOpen"
    :isActionEnabled="isActionEnabled">
    <template #headerColumns>
      <oc-table-cell type="head" class="uk-text-truncate" v-translate>Name</oc-table-cell>
      <oc-table-cell shrink type="head" class="uk-text-nowrap" v-text="sharedCellTitle" />
      <oc-table-cell
        v-if="$route.name === 'files-shared-with-me'"
        shrink
        type="head"
        class="uk-text-nowrap"
        v-translate
      >
        Status
      </oc-table-cell>
      <oc-table-cell shrink type="head" class="uk-text-nowrap" v-translate>Share time</oc-table-cell>
    </template>
    <template #rowColumns="{ item }">
      <oc-table-cell class="uk-text-truncate">
        <oc-file @click.native.stop="item.type === 'folder' ? navigateTo(item.path.substr(1)) : openFileActionBar(item)"
          :name="item.basename" :extension="item.extension" class="file-row-name" :icon="fileTypeIcon(item)"
          :filename="item.name" :key="item.path" />
        <oc-spinner
          v-if="actionInProgress(item)"
          size="small"
          :uk-tooltip="disabledActionTooltip(item)"
          class="uk-margin-small-left"
        />
      </oc-table-cell>
      <oc-table-cell class="uk-text-meta uk-text-nowrap">
        <div v-if="$route.name === 'files-shared-with-others'" key="shared-with-cell">
          {{ item.sharedWith }} (<translate v-if="item.shareType === 1">group</translate>)
        </div>
        <div v-else key="shared-from-cell">
          {{ item.shareOwnerDisplayname }}
        </div>
      </oc-table-cell>
      <oc-table-cell v-if="$route.name === 'files-shared-with-me'" class="uk-text-nowrap uk-text-right" :key="item.id + item.status">
        <a v-if="item.status === 1 || item.status === 2" class="uk-text-meta" @click="pendingShareAction(item, 'POST')" v-translate>Accept</a>
        <a v-if="item.status === 1" class="uk-text-meta uk-margin-left" @click="pendingShareAction(item, 'DELETE')" v-translate>Decline</a>
        <span class="uk-text-small uk-margin-left" v-text="shareStatus(item.status)" />
      </oc-table-cell>
      <oc-table-cell class="uk-text-meta uk-text-nowrap" v-text="formDateFromNow(item.shareTime)" />
    </template>
  </file-list>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Mixins from '../../mixins'
import FileActions from '../../fileactions'
import FileList from '../FileList.vue'

export default {
  name: 'SharedFilesList',
  mixins: [
    Mixins,
    FileActions
  ],
  components: {
    FileList
  },
  props: {
    /**
       * Array of active files
       */
    fileData: {
      type: Array,
      required: true,
      default: null
    }
  },
  computed: {
    ...mapGetters('Files', ['loadingFolder']),

    sharedCellTitle () {
      if (this.$route.name === 'files-shared-with-me') {
        return this.$gettext('Shared from')
      }

      return this.$gettext('Shared with')
    }
  },
  watch: {
    $route () {
      if (this.$route.name === 'files-shared-with-me') {
        this.$_ocSharedWithMe_getFiles()
      } else {
        this.$_ocSharedFromMe_getFiles()
      }
    }
  },
  mounted () {
    if (this.$route.name === 'files-shared-with-me') {
      this.$_ocSharedWithMe_getFiles()
    } else {
      this.$_ocSharedFromMe_getFiles()
    }
  },
  methods: {
    ...mapActions('Files', ['loadFolderSharedFromMe', 'loadFolderSharedWithMe', 'setFilterTerm', 'pendingShare']),

    $_ocSharedFromMe_getFiles () {
      this.setFilterTerm('')
      this.loadFolderSharedFromMe({
        client: this.$client,
        $gettext: this.$gettext
      })
    },

    $_ocSharedWithMe_getFiles () {
      this.setFilterTerm('')
      this.loadFolderSharedWithMe({
        client: this.$client,
        $gettext: this.$gettext
      })
    },

    isActionEnabled (item, action) {
      return action.isEnabled(item, null)
    },

    shareStatus (status) {
      if (status === 0) return

      if (status === 1) return this.$gettext('Pending')

      if (status === 2) return this.$gettext('Declined')
    },

    pendingShareAction (item, type) {
      this.pendingShare({
        client: this.$client,
        item: item,
        type: type,
        translate: this.$gettext()
      })
    }
  }
}
</script>

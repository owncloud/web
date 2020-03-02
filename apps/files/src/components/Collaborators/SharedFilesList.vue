<template>
  <file-list :fileData="fileData" id="files-list" :loading="loadingFolder" :actions="actions" :compactMode="_sidebarOpen"
    :isActionEnabled="isActionEnabled">
    <template #headerColumns>
      <div class="uk-text-truncate uk-text-meta uk-width-expand">
        <sortable-column-header @click="toggleSort('name')" :aria-label="$gettext('Sort files by name')" :is-active="fileSortField == 'name'" :is-desc="fileSortDirectionDesc">
          <translate translate-context="Name column in files table">Name</translate>
        </sortable-column-header>
      </div>
      <div><!-- indicators column --></div>
      <div key="shared-with-header-cell" v-if="!$_isSharedWithMe" class="uk-visible@s uk-text-nowrap uk-text-meta uk-width-medium" translate-context="Collaborators table column" v-text="$gettext('Collaborators')" />
      <div key="shared-with-header-cell" v-else class="uk-visible@s uk-text-nowrap uk-text-meta uk-width-small" translate-context="Owner table column" v-text="$gettext('Owner')" />
      <div
        v-if="$route.name === 'files-shared-with-me'"
        shrink
        type="head"
        class="uk-text-nowrap uk-text-meta uk-width-small"
        v-translate
      >
        Status
      </div>
      <div class="uk-visible@s uk-text-nowrap uk-text-meta uk-width-small">
        <sortable-column-header @click="toggleSort('shareTimeMoment')" :aria-label="$gettext('Sort files by share time')" :is-active="fileSortField == 'shareTimeMoment'" :is-desc="fileSortDirectionDesc">
          <translate translate-context="Share time column in files table">Share time</translate>
        </sortable-column-header>
      </div>
    </template>
    <template #rowColumns="{ item }">
      <div class="uk-text-truncate uk-width-expand">
        <oc-file @click.native.stop="item.type === 'folder' ? navigateTo(item.path.substr(1)) : openFileActionBar(item)"
          :name="item.basename" :extension="item.extension" class="file-row-name" :icon="fileTypeIcon(item)"
          :filename="item.name" :key="item.path" />
        <oc-spinner
          v-if="actionInProgress(item)"
          size="small"
          :uk-tooltip="disabledActionTooltip(item)"
          class="uk-margin-small-left"
        />
      </div>
      <div><!-- indicators column --></div>
      <div key="shared-with-cell" v-if="!$_isSharedWithMe" class="uk-visible@s uk-text-meta uk-text-nowrap uk-text-truncate uk-width-medium uk-flex file-row-collaborators">
        <span v-for="share in item.shares" :key="share.id" class="uk-margin-small-right uk-flex uk-flex-middle">
          <avatar-image :key="'avatar-' + share.id" v-if="share.shareType === shareTypes.user && share.collaborator" class="uk-margin-xsmall-right" :width="24" :userid="share.collaborator.name" :userName="share.collaborator.displayName" />
          <oc-icon
            v-else
            :key="'icon-' + share.id"
            :name="$_shareTypeIcon(share.shareType)"
            class="uk-margin-xsmall-right"
            size="small"
            variation="active"
            aria-hidden="true"
          />
          <span :key="'collaborator-name-' + share.id" v-if="share.collaborator" class="file-row-collaborator-name" v-text="share.collaborator.displayName" />
          <translate :key="'collaborator-name-public-' + share.id" v-if="share.shareType === shareTypes.link" class="file-row-collaborator-name" translate-context="Short public link indicator">Public</translate>
        </span>
      </div>
      <div v-else key="shared-from-cell" class="uk-visible@s uk-text-meta uk-text-nowrap uk-text-truncate uk-width-small uk-flex uk-flex-middle file-row-collaborators">
        <avatar-image class="uk-margin-xsmall-right" :width="24" :userid="item.shareOwner.username" :userName="item.shareOwner.displayName" />
        <span class="file-row-owner-name" v-text="item.shareOwner.displayName"/>
      </div>
      <div v-if="$_isSharedWithMe" class="uk-text-nowrap uk-width-small" :key="item.id + item.status">
        <a v-if="item.status === 1 || item.status === 2" class="file-row-share-status-action uk-text-meta" @click="pendingShareAction(item, 'POST')" v-translate>Accept</a>
        <a v-if="item.status === 1" class="file-row-share-status-action uk-text-meta uk-margin-left" @click="pendingShareAction(item, 'DELETE')" v-translate>Decline</a>
        <span class="uk-text-small uk-margin-left file-row-share-status-text" v-text="shareStatus(item.status)" />
      </div>
      <div class="uk-visible@s uk-text-meta uk-text-nowrap uk-width-small" v-text="formDateFromNow(item.shareTime)" />
    </template>
    <template #noContentMessage>
      <no-content-message icon="share">
        <template #message>
          <span v-if="$_isSharedWithMe" v-translate>You are currently not collaborating on other people's resources.</span>
          <span v-else v-translate>You are currently not collaborating on any of your resources with other people.</span>
        </template>
      </no-content-message>
    </template>
  </file-list>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Mixins from '../../mixins'
import FileActions from '../../fileactions'
import FileList from '../FileList.vue'
import NoContentMessage from '../NoContentMessage.vue'
import SortableColumnHeader from '../FilesLists/SortableColumnHeader.vue'
import { shareTypes } from '../../helpers/shareTypes'

export default {
  name: 'SharedFilesList',
  components: {
    FileList,
    NoContentMessage,
    SortableColumnHeader
  },
  mixins: [
    Mixins,
    FileActions
  ],
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

    shareTypes () {
      return shareTypes
    },

    $_isSharedWithMe () {
      return (this.$route.name === 'files-shared-with-me')
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
  beforeMount () {
    if (this.$route.name === 'files-shared-with-me') {
      this.$_ocSharedWithMe_getFiles()
    } else {
      this.$_ocSharedFromMe_getFiles()
    }
  },
  methods: {
    ...mapActions('Files', ['loadFolderSharedFromMe', 'loadFolderSharedWithMe', 'setFilterTerm', 'pendingShare']),

    $_shareTypeIcon (type) {
      switch (type) {
        case shareTypes.user: return 'person'
        case shareTypes.group: return 'group'
        case shareTypes.link: return 'link'
      }
    },

    $_ocSharedFromMe_getFiles () {
      this.loadFolderSharedFromMe({
        client: this.$client,
        $gettext: this.$gettext
      })
    },

    $_ocSharedWithMe_getFiles () {
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
        $gettext: this.$gettext
      })
    }
  }
}
</script>

<template>
  <div id="oc-files-sharing-sidebar" class="oc-position-relative">
    <div class="oc-flex oc-flex-between oc-flex-center oc-flex-middle">
      <div class="oc-flex">
        <h3 v-translate class="oc-text-bold oc-text-medium oc-m-rm">Members</h3>
        <oc-contextual-helper v-if="helpersEnabled" class="oc-pl-xs" v-bind="spaceAddMemberHelp" />
      </div>
      <div class="oc-flex">
        <div v-if="isSearchOpen" class="oc-flex">
          <oc-text-input
            v-model="filterTerm"
            class="oc-text-truncate space-members-filter oc-mr-s"
            label=""
            :placeholder="$gettext('Search members')"
          />
          <oc-button
            v-oc-tooltip="$gettext('Close search')"
            :aria-label="$gettext('Close search')"
            appearance="raw"
            @click="toggleSearch"
          >
            <oc-icon name="close" fill-type="line" size="small" />
          </oc-button>
        </div>
        <oc-button
          v-else
          v-oc-tooltip="$gettext('Search members')"
          :aria-label="$gettext('Search members')"
          appearance="raw"
          @click="toggleSearch"
        >
          <oc-icon name="search" fill-type="line" size="small" />
        </oc-button>
      </div>
    </div>
    <invite-collaborator-form
      v-if="currentUserCanShare"
      key="new-collaborator"
      :save-button-label="$gettext('Add')"
      :invite-label="$gettext('Add members')"
      class="oc-my-s"
    />
    <template v-if="hasCollaborators">
      <ul
        id="files-collaborators-list"
        ref="collaboratorList"
        class="oc-list oc-list-divider oc-overflow-hidden oc-m-rm"
        :aria-label="$gettext('Space members')"
      >
        <li v-for="collaborator in filteredSpaceMembers" :key="collaborator.key">
          <collaborator-list-item
            :share="collaborator"
            :modifiable="isModifiable(collaborator)"
            @onDelete="$_ocCollaborators_deleteShare_trigger(collaborator)"
          />
        </li>
      </ul>
    </template>
  </div>
</template>

<script lang="ts">
import { mapGetters, mapActions, mapState } from 'vuex'
import CollaboratorListItem from './Collaborators/ListItem.vue'
import InviteCollaboratorForm from './Collaborators/InviteCollaborator/InviteCollaboratorForm.vue'
import { spaceRoleManager } from 'web-client/src/helpers/share'
import { createLocationSpaces, isLocationSpacesActive } from '../../../router'
import { defineComponent, PropType } from '@vue/composition-api'
import { shareSpaceAddMemberHelp } from '../../../helpers/contextualHelpers'
import { SpaceResource } from 'web-client/src/helpers'
import { useGraphClient } from 'web-pkg/src/composables'
import Fuse from 'fuse.js'
import Mark from 'mark.js'

export default defineComponent({
  name: 'SpaceMembers',
  components: {
    CollaboratorListItem,
    InviteCollaboratorForm
  },
  props: {
    space: {
      type: Object as PropType<SpaceResource>,
      required: false,
      default: null
    }
  },
  setup() {
    return {
      ...useGraphClient()
    }
  },
  data: () => {
    return {
      filterTerm: '',
      isSearchOpen: false,
      markInstance: null
    }
  },
  computed: {
    ...mapGetters(['configuration']),
    ...mapGetters('runtime/spaces', ['spaceMembers']),
    ...mapState(['user']),

    filteredSpaceMembers() {
      return this.filter(this.spaceMembers, this.filterTerm)
    },
    helpersEnabled() {
      return this.configuration?.options?.contextHelpers
    },
    spaceAddMemberHelp() {
      return shareSpaceAddMemberHelp
    },
    hasCollaborators() {
      return this.spaceMembers.length > 0
    },
    currentUserCanShare() {
      return this.currentUserIsManager
    },
    currentUserIsManager() {
      const currentUserCollaborator = this.spaceMembers.find(
        (collaborator) => collaborator.collaborator.name === this.user.id
      )

      return currentUserCollaborator?.role?.name === spaceRoleManager.name
    }
  },
  watch: {
    isSearchOpen() {
      this.filterTerm = ''
    },
    filterTerm() {
      this.$nextTick(() => {
        if (this.$refs.collaboratorList) {
          this.markInstance = new Mark(this.$refs.collaboratorList.$el)
          this.markInstance.unmark()
          console.log(this.markInstance)
          this.markInstance.mark(this.filterTerm, {
            element: 'span',
            className: 'highlight-mark'
          })
        }
      })
    }
  },
  methods: {
    ...mapActions('runtime/spaces', ['deleteSpaceMember']),
    ...mapActions(['createModal', 'hideModal', 'showMessage']),

    filter(collection, term) {
      if (!(term || '').trim()) {
        return collection
      }
      const searchEngine = new Fuse(collection, {
        includeScore: true,
        useExtendedSearch: true,
        threshold: 0.3,
        keys: ['collaborator.displayName', 'collaborator.name']
      })

      return searchEngine.search(term).map((r) => r.item)
    },
    toggleSearch() {
      this.isSearchOpen = !this.isSearchOpen
    },
    isModifiable(share) {
      if (!this.currentUserIsManager) {
        return false
      }

      if (share.role.name !== spaceRoleManager.name) {
        return true
      }

      // forbid to remove last manager of a space
      const managers = this.spaceMembers.filter(
        (collaborator) => collaborator.role.name === spaceRoleManager.name
      )
      return managers.length > 1
    },

    $_ocCollaborators_deleteShare_trigger(share) {
      const modal = {
        variation: 'danger',
        icon: 'alarm-warning',
        title: this.$gettext('Remove share'),
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Remove'),
        message: this.$gettext('Are you sure you want to remove this share?'),
        hasInput: false,
        onCancel: this.hideModal,
        onConfirm: () => this.$_ocCollaborators_deleteShare(share)
      }

      this.createModal(modal)
    },

    async $_ocCollaborators_deleteShare(share) {
      try {
        const currentUserRemoved = share.collaborator.name === this.user.id
        await this.deleteSpaceMember({
          client: this.$client,
          graphClient: this.graphClient,
          share: share,
          reloadSpace: !currentUserRemoved
        })
        this.showMessage({
          title: this.$gettext('Share was removed successfully')
        })

        if (currentUserRemoved) {
          if (isLocationSpacesActive(this.$router, 'files-spaces-projects')) {
            return this.$router.go()
          }
          return this.$router.push(createLocationSpaces('files-spaces-projects'))
        }
      } catch (error) {
        console.error(error)
        this.showMessage({
          title: this.$gettext('Failed to remove share'),
          status: 'danger'
        })
      } finally {
        this.hideModal()
      }
    }
  }
})
</script>

<style>
.space-members-filter {
  max-width: 160px;
}
.avatars-wrapper {
  height: 40px;
}
</style>

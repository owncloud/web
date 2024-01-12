<template>
  <div id="oc-files-sharing-sidebar" class="oc-position-relative">
    <div class="oc-flex oc-flex-between oc-flex-center oc-flex-middle">
      <div class="oc-flex oc-py-s">
        <h3 v-translate class="oc-text-bold oc-text-medium oc-m-rm">Members</h3>
        <oc-contextual-helper v-if="helpersEnabled" class="oc-pl-xs" v-bind="spaceAddMemberHelp" />
      </div>
      <div class="oc-flex">
        <div v-if="isFilterOpen" class="oc-flex">
          <oc-text-input
            v-model="filterTerm"
            class="oc-text-truncate space-members-filter oc-mr-s"
            label=""
            :placeholder="$gettext('Filter members')"
          />
          <oc-button
            v-oc-tooltip="$gettext('Close filter')"
            class="close-filter-btn"
            :aria-label="$gettext('Close filter')"
            appearance="raw"
            @click="toggleFilter"
          >
            <oc-icon name="close" fill-type="line" size="small" />
          </oc-button>
        </div>
        <oc-button
          v-else
          v-oc-tooltip="$gettext('Filter members')"
          class="open-filter-btn"
          :aria-label="$gettext('Filter members')"
          appearance="raw"
          @click="toggleFilter"
        >
          <oc-icon name="search" fill-type="line" size="small" />
        </oc-button>
      </div>
    </div>
    <invite-collaborator-form
      v-if="currentUserCanShare"
      key="new-collaborator"
      :save-button-label="$gettext('Add')"
      :invite-label="$gettext('Search')"
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
            @on-delete="$_ocCollaborators_deleteShare_trigger(collaborator)"
          />
        </li>
      </ul>
    </template>
  </div>
</template>

<script lang="ts">
import { storeToRefs } from 'pinia'
import CollaboratorListItem from './Collaborators/ListItem.vue'
import InviteCollaboratorForm from './Collaborators/InviteCollaborator/InviteCollaboratorForm.vue'
import { spaceRoleManager } from '@ownclouders/web-client/src/helpers/share'
import {
  createLocationSpaces,
  isLocationSpacesActive,
  useConfigStore,
  useMessages,
  useModals,
  useSpacesStore,
  useUserStore
} from '@ownclouders/web-pkg'
import { defineComponent, inject, Ref } from 'vue'
import { shareSpaceAddMemberHelp } from '../../../helpers/contextualHelpers'
import { ProjectSpaceResource } from '@ownclouders/web-client/src/helpers'
import { useClientService } from '@ownclouders/web-pkg'
import Fuse from 'fuse.js'
import Mark from 'mark.js'
import { defaultFuseOptions } from '@ownclouders/web-pkg'

export default defineComponent({
  name: 'SpaceMembers',
  components: {
    CollaboratorListItem,
    InviteCollaboratorForm
  },
  setup() {
    const userStore = useUserStore()
    const clientService = useClientService()
    const { dispatchModal } = useModals()
    const spacesStore = useSpacesStore()
    const { deleteSpaceMember } = spacesStore
    const { spaceMembers } = storeToRefs(spacesStore)

    const configStore = useConfigStore()
    const { options: configOptions } = storeToRefs(configStore)

    const { user } = storeToRefs(userStore)

    return {
      user,
      clientService,
      configStore,
      configOptions,
      resource: inject<Ref<ProjectSpaceResource>>('resource'),
      dispatchModal,
      spaceMembers,
      deleteSpaceMember,
      ...useMessages()
    }
  },
  data: () => {
    return {
      filterTerm: '',
      isFilterOpen: false,
      markInstance: null
    }
  },
  computed: {
    filteredSpaceMembers() {
      return this.filter(this.spaceMembers, this.filterTerm)
    },
    helpersEnabled() {
      return this.configStore.options.contextHelpers
    },
    spaceAddMemberHelp() {
      return shareSpaceAddMemberHelp({ configStore: this.configStore })
    },
    hasCollaborators() {
      return this.spaceMembers.length > 0
    },
    currentUserCanShare() {
      return !this.resource.disabled && this.currentUserIsManager
    },
    currentUserIsManager() {
      return this.resource.isManager(this.user)
    }
  },
  watch: {
    isFilterOpen() {
      this.filterTerm = ''
    },
    filterTerm() {
      this.$nextTick(() => {
        if (this.$refs.collaboratorList) {
          this.markInstance = new Mark(this.$refs.collaboratorList)
          this.markInstance.unmark()
          this.markInstance.mark(this.filterTerm, {
            element: 'span',
            className: 'mark-highlight'
          })
        }
      })
    }
  },
  methods: {
    filter(collection, term) {
      if (!(term || '').trim()) {
        return collection
      }
      const searchEngine = new Fuse(collection, {
        ...defaultFuseOptions,
        keys: ['collaborator.displayName', 'collaborator.name']
      })

      return searchEngine.search(term).map((r) => r.item)
    },
    toggleFilter() {
      this.isFilterOpen = !this.isFilterOpen
    },
    isModifiable(share) {
      if (!this.currentUserCanShare) {
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
      this.dispatchModal({
        variation: 'danger',
        title: this.$gettext('Remove member'),
        confirmText: this.$gettext('Remove'),
        message: this.$gettext('Are you sure you want to remove this member?'),
        hasInput: false,
        onConfirm: () => this.$_ocCollaborators_deleteShare(share)
      })
    },

    async $_ocCollaborators_deleteShare(share) {
      try {
        const currentUserRemoved = share.collaborator.name === this.user.onPremisesSamAccountName
        await this.deleteSpaceMember({
          client: this.$client,
          graphClient: this.clientService.graphAuthenticated,
          share: share,
          reloadSpace: !currentUserRemoved
        })
        this.showMessage({
          title: this.$gettext('Share was removed successfully')
        })

        if (currentUserRemoved) {
          if (isLocationSpacesActive(this.$router, 'files-spaces-projects')) {
            await this.$router.go(0)
            return
          }
          await this.$router.push(createLocationSpaces('files-spaces-projects'))
        }
      } catch (error) {
        console.error(error)
        this.showErrorMessage({
          title: this.$gettext('Failed to remove share'),
          errors: [error]
        })
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

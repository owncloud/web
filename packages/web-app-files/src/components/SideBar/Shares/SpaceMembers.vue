<template>
  <div id="oc-files-sharing-sidebar" class="oc-position-relative">
    <div class="oc-flex oc-flex-between oc-flex-center oc-flex-middle">
      <div class="oc-flex oc-py-s">
        <h3 v-translate class="oc-text-bold oc-text-medium oc-m-rm">Add members</h3>
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
      v-if="canShare({ space: resource, resource })"
      key="new-collaborator"
      :save-button-label="$gettext('Add')"
      :invite-label="$gettext('Search')"
      class="oc-my-s"
    />
    <template v-if="hasCollaborators">
      <div id="files-collaborators-headline" class="oc-flex oc-flex-middle oc-flex-between">
        <h4 class="oc-text-bold oc-my-rm" v-text="$gettext('Members')" />
        <copy-private-link v-if="filesPrivateLinks" :resource="resource" />
      </div>

      <ul
        id="files-collaborators-list"
        ref="collaboratorList"
        class="oc-list oc-list-divider oc-overflow-hidden oc-m-rm"
        :aria-label="$gettext('Space members')"
      >
        <li v-for="collaborator in filteredSpaceMembers" :key="collaborator.id">
          <collaborator-list-item
            :share="collaborator"
            :modifiable="isModifiable(collaborator)"
            :is-space-share="true"
            @on-delete="deleteMemberConfirm(collaborator)"
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
import { GraphShareRoleIdMap } from '@ownclouders/web-client'
import {
  createLocationSpaces,
  isLocationSpacesActive,
  useCanShare,
  useCapabilityStore,
  useConfigStore,
  useMessages,
  useModals,
  useSharesStore,
  useSpacesStore,
  useUserStore
} from '@ownclouders/web-pkg'
import { defineComponent, inject, ref, Ref } from 'vue'
import { shareSpaceAddMemberHelp } from '../../../helpers/contextualHelpers'
import { ProjectSpaceResource, CollaboratorShare, buildSpace } from '@ownclouders/web-client'
import { useClientService } from '@ownclouders/web-pkg'
import Fuse from 'fuse.js'
import Mark from 'mark.js'
import { defaultFuseOptions } from '@ownclouders/web-pkg'
import CopyPrivateLink from '../../Shares/CopyPrivateLink.vue'

export default defineComponent({
  name: 'SpaceMembers',
  components: {
    CopyPrivateLink,
    CollaboratorListItem,
    InviteCollaboratorForm
  },
  setup() {
    const userStore = useUserStore()
    const clientService = useClientService()
    const { canShare } = useCanShare()
    const { dispatchModal } = useModals()
    const { deleteShare } = useSharesStore()
    const spacesStore = useSpacesStore()
    const { upsertSpace, removeSpaceMember } = spacesStore
    const { spaceMembers } = storeToRefs(spacesStore)
    const capabilityStore = useCapabilityStore()
    const { filesPrivateLinks } = storeToRefs(capabilityStore)

    const configStore = useConfigStore()
    const { options: configOptions } = storeToRefs(configStore)

    const { user } = storeToRefs(userStore)

    const markInstance = ref<Mark>()

    return {
      user,
      clientService,
      configStore,
      configOptions,
      resource: inject<Ref<ProjectSpaceResource>>('resource'),
      dispatchModal,
      spaceMembers,
      deleteShare,
      upsertSpace,
      removeSpaceMember,
      canShare,
      markInstance,
      filesPrivateLinks,
      ...useMessages()
    }
  },
  data: () => {
    return {
      filterTerm: '',
      isFilterOpen: false
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
    }
  },
  watch: {
    isFilterOpen() {
      this.filterTerm = ''
    },
    filterTerm() {
      this.$nextTick(() => {
        if (this.$refs.collaboratorList) {
          this.markInstance = new Mark(this.$refs.collaboratorList as HTMLElement)
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
    filter(collection: CollaboratorShare[], term: string) {
      if (!(term || '').trim()) {
        return collection
      }
      const searchEngine = new Fuse(collection, {
        ...defaultFuseOptions,
        keys: ['sharedWith.displayName', 'sharedWith.name']
      })

      return searchEngine.search(term).map((r) => r.item)
    },
    toggleFilter() {
      this.isFilterOpen = !this.isFilterOpen
    },
    isModifiable(share: CollaboratorShare) {
      if (!this.canShare({ space: this.resource, resource: this.resource })) {
        return false
      }

      if (share.role.id !== GraphShareRoleIdMap.SpaceManager) {
        return true
      }

      // forbid to remove last manager of a space
      const managers = this.spaceMembers.filter(
        ({ role }) => role.id === GraphShareRoleIdMap.SpaceManager
      )
      return managers.length > 1
    },

    deleteMemberConfirm(share: CollaboratorShare) {
      this.dispatchModal({
        variation: 'danger',
        title: this.$gettext('Remove member'),
        confirmText: this.$gettext('Remove'),
        message: this.$gettext('Are you sure you want to remove this member?'),
        hasInput: false,
        onConfirm: async () => {
          try {
            const currentUserRemoved = share.sharedWith.id === this.user.id
            await this.deleteShare({
              clientService: this.clientService,
              space: this.resource,
              resource: this.resource,
              collaboratorShare: share
            })

            if (!currentUserRemoved) {
              const client = this.clientService.graphAuthenticated
              const graphResponse = await client.drives.getDrive(share.resourceId)
              this.upsertSpace(buildSpace(graphResponse.data))
            }

            this.removeSpaceMember({ member: share })

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
      })
    }
  }
})
</script>

<style>
.space-members-filter {
  max-width: 160px;
}

#files-collaborators-headline {
  height: 40px;
}
</style>

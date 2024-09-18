<template>
  <div id="oc-files-sharing-sidebar" class="oc-position-relative">
    <div class="oc-flex oc-flex-between oc-flex-center oc-flex-middle">
      <div class="oc-flex oc-py-s">
        <h3 v-translate class="oc-text-bold oc-text-medium oc-m-rm">Add members</h3>
        <oc-contextual-helper v-if="helpersEnabled" class="oc-pl-xs" v-bind="spaceAddMemberHelp" />
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
      <div
        id="files-collaborators-headline"
        class="oc-flex oc-flex-middle oc-flex-between oc-position-relative"
      >
        <div class="oc-flex">
          <h4 class="oc-text-bold oc-my-rm" v-text="$gettext('Members')" />
          <oc-button
            v-oc-tooltip="$gettext('Filter members')"
            class="open-filter-btn oc-ml-s"
            :aria-label="$gettext('Filter members')"
            appearance="raw"
            :aria-expanded="isFilterOpen"
            @click="toggleFilter"
          >
            <oc-icon name="search" fill-type="line" size="small" />
          </oc-button>
        </div>
        <copy-private-link v-if="filesPrivateLinks" :resource="resource" />
      </div>
      <div
        class="oc-flex oc-flex-between space-members-filter-container"
        :class="{ 'space-members-filter-container-expanded': isFilterOpen }"
      >
        <oc-text-input
          ref="filterInput"
          v-model="filterTerm"
          class="oc-text-truncate space-members-filter oc-mr-s oc-width-1-1"
          :label="$gettext('Filter members')"
          :clear-button-enabled="true"
        />
        <oc-button
          v-oc-tooltip="$gettext('Close filter')"
          class="close-filter-btn oc-mt-m"
          :aria-label="$gettext('Close filter')"
          appearance="raw"
          @click="toggleFilter"
        >
          <oc-icon name="arrow-up-s" fill-type="line" />
        </oc-button>
      </div>

      <ul
        id="files-collaborators-list"
        ref="collaboratorList"
        class="oc-list oc-list-divider oc-m-rm"
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
import { GraphSharePermission } from '@ownclouders/web-client'
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
import { computed, defineComponent, inject, nextTick, ref, Ref, unref, useTemplateRef } from 'vue'
import { shareSpaceAddMemberHelp } from '../../../helpers/contextualHelpers'
import { ProjectSpaceResource, CollaboratorShare } from '@ownclouders/web-client'
import { useClientService } from '@ownclouders/web-pkg'
import Fuse from 'fuse.js'
import Mark from 'mark.js'
import { defaultFuseOptions } from '@ownclouders/web-pkg'
import CopyPrivateLink from '../../Shares/CopyPrivateLink.vue'
import { OcTextInput } from 'design-system/src/components'

export default defineComponent({
  name: 'SpaceMembers',
  components: {
    CopyPrivateLink,
    CollaboratorListItem,
    InviteCollaboratorForm
  },
  setup() {
    const filterInput = useTemplateRef<typeof OcTextInput>('filterInput')

    const userStore = useUserStore()
    const clientService = useClientService()
    const { canShare } = useCanShare()
    const { dispatchModal } = useModals()
    const sharesStore = useSharesStore()
    const { deleteShare } = sharesStore
    const { graphRoles } = storeToRefs(sharesStore)
    const spacesStore = useSpacesStore()
    const { upsertSpace, getSpaceMembers } = spacesStore
    const capabilityStore = useCapabilityStore()
    const { filesPrivateLinks } = storeToRefs(capabilityStore)

    const configStore = useConfigStore()
    const { options: configOptions } = storeToRefs(configStore)

    const { user } = storeToRefs(userStore)

    const markInstance = ref<Mark>()
    const filterTerm = ref('')
    const isFilterOpen = ref(false)

    const resource = inject<Ref<ProjectSpaceResource>>('resource')

    const spaceMembers = computed(() => getSpaceMembers(unref(resource)))

    return {
      user,
      clientService,
      configStore,
      configOptions,
      resource,
      dispatchModal,
      spaceMembers,
      deleteShare,
      upsertSpace,
      canShare,
      markInstance,
      filesPrivateLinks,
      graphRoles,
      filterTerm,
      isFilterOpen,
      filterInput,
      ...useMessages()
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
    async toggleFilter() {
      this.isFilterOpen = !this.isFilterOpen
      if (this.isFilterOpen) {
        await nextTick()
        this.filterInput.focus()
      }
    },
    isModifiable(share: CollaboratorShare) {
      if (!this.canShare({ space: this.resource, resource: this.resource })) {
        return false
      }

      const memberCanUpdateMembers = share.permissions.includes(
        GraphSharePermission.updatePermissions
      )
      if (!memberCanUpdateMembers) {
        return true
      }

      // make sure at least one member can edit other members
      const managers = this.spaceMembers.filter(({ permissions }) =>
        permissions.includes(GraphSharePermission.updatePermissions)
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
              const space = await client.drives.getDrive(share.resourceId, this.graphRoles)
              this.upsertSpace(space)
            }

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

<style lang="scss">
.space-members-filter {
  label {
    font-size: var(--oc-font-size-small);
  }

  &-container {
    max-height: 0px;
    visibility: hidden;
    transition:
      max-height 0.25s ease-in-out,
      margin-bottom 0.25s ease-in-out,
      visibility 0.25s ease-in-out;

    &-expanded {
      max-height: 60px;
      visibility: visible;
      transition:
        max-height 0.25s ease-in-out,
        margin-bottom 0.25s ease-in-out,
        visibility 0s;
      margin-bottom: var(--oc-space-medium);
    }
  }
}

#files-collaborators-headline {
  height: 40px;
}
</style>

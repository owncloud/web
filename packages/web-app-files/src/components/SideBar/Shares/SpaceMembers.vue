<template>
  <div id="oc-files-sharing-sidebar" class="oc-position-relative">
    <div class="oc-flex">
      <h3 v-translate class="oc-text-bold oc-text-medium oc-m-rm">Members</h3>
      <oc-contextual-helper v-if="helpersEnabled" class="oc-pl-xs" v-bind="spaceAddMemberHelp" :aria-label="helperLabel" />
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
        class="oc-list oc-list-divider oc-overflow-hidden oc-m-rm"
        :aria-label="$gettext('Space members')"
      >
        <li v-for="collaborator in spaceMembers" :key="collaborator.key">
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
import { defineComponent } from '@vue/composition-api'
import { shareSpaceAddMemberHelp } from '../../../helpers/contextualHelpers'

export default defineComponent({
  name: 'SpaceMembers',
  components: {
    CollaboratorListItem,
    InviteCollaboratorForm
  },
  inject: ['displayedItem'],
  computed: {
    ...mapGetters(['configuration']),
    ...mapGetters('runtime/spaces', ['spaceMembers']),
    ...mapState(['user']),

    helpersEnabled() {
      return this.configuration?.options?.contextHelpers
    },
    helperLabel(){
      return this.$gettext('Contextual helper')
    },
    spaceAddMemberHelp() {
      return shareSpaceAddMemberHelp
    },
    space() {
      return this.displayedItem.value
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
  methods: {
    ...mapActions('runtime/spaces', ['deleteSpaceMember']),
    ...mapActions(['createModal', 'hideModal', 'showMessage']),

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
        await this.deleteSpaceMember({ client: this.$client, share: share })
        this.showMessage({
          title: this.$gettext('Share was removed successfully')
        })
        // current user was removed from the share.
        if (share.collaborator.name === this.user.id) {
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
.avatars-wrapper {
  height: 40px;
}
</style>

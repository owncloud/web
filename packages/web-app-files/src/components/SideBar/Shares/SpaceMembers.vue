<template>
  <div id="oc-files-sharing-sidebar" class="oc-position-relative">
    <oc-loader v-if="sharesLoading" :aria-label="$gettext('Loading members')" />
    <template v-else>
      <invite-collaborator-form
        v-if="currentUserCanShare"
        key="new-collaborator"
        :saving-button-title="$gettext('Add')"
        class="oc-my-s"
      />
      <template v-if="hasCollaborators">
        <ul
          id="files-collaborators-list"
          class="oc-list oc-list-divider oc-overflow-hidden oc-m-rm"
          :aria-label="$gettext('Space members')"
        >
          <li v-for="collaborator in members" :key="collaborator.key">
            <collaborator-list-item
              :share="collaborator"
              :modifiable="isModifiable(collaborator)"
              @onDelete="$_ocCollaborators_deleteShare_trigger(collaborator)"
            />
          </li>
        </ul>
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import { mapGetters, mapActions, mapState } from 'vuex'
import { useStore } from 'web-pkg/src/composables'
import { clientService } from 'web-pkg/src/services'
import CollaboratorListItem from './Collaborators/ListItem.vue'
import InviteCollaboratorForm from './Collaborators/InviteCollaborator/InviteCollaboratorForm.vue'
import { ShareTypes, spaceRoleManager } from '../../../helpers/share'
import { createLocationSpaces, isLocationSpacesActive } from '../../../router'
import { useTask } from 'vue-concurrency'
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: 'SpaceMembers',
  components: {
    CollaboratorListItem,
    InviteCollaboratorForm
  },
  inject: ['displayedItem'],
  setup() {
    const store = useStore()
    const graphClient = clientService.graphAuthenticated(
      store.getters.configuration.server,
      store.getters.getToken
    )

    const loadSharesTask = useTask(function* (signal, ref) {
      yield ref.loadCurrentFileOutgoingShares({
        client: ref.$client,
        graphClient,
        path: ref.space.id,
        storageId: ref.space.id,
        resource: ref.space
      })
    })

    return { graphClient, loadSharesTask }
  },
  computed: {
    ...mapGetters('Files', [
      'highlightedFile',
      'currentFileOutgoingCollaborators',
      'currentFileOutgoingSharesLoading',
      'sharesTreeLoading'
    ]),
    ...mapState(['user']),
    space() {
      return this.displayedItem.value
    },
    members() {
      return this.currentFileOutgoingCollaborators.filter(
        (share) => share.shareType === ShareTypes.space.value
      )
    },
    sharesLoading() {
      return this.currentFileOutgoingSharesLoading
    },
    hasCollaborators() {
      return this.members.length > 0
    },
    currentUserCanShare() {
      return this.currentUserIsManager
    },
    currentUserIsManager() {
      const currentUserCollaborator = this.members.find(
        (collaborator) => collaborator.collaborator.name === this.user.id
      )

      return currentUserCollaborator?.role?.name === spaceRoleManager.name
    }
  },
  watch: {
    highlightedFile: {
      handler: function (newItem, oldItem) {
        if (oldItem !== newItem) {
          this.loadSharesTask.perform(this)
        }
      },
      immediate: true
    }
  },
  methods: {
    ...mapActions('Files', ['loadCurrentFileOutgoingShares', 'deleteShare']),
    ...mapActions(['createModal', 'hideModal', 'showMessage']),

    isModifiable(share) {
      if (!this.currentUserIsManager) {
        return false
      }

      if (share.role.name !== spaceRoleManager.name) {
        return true
      }

      // forbid to remove last manager of a space
      const managers = this.members.filter(
        (collaborator) => collaborator.role.name === spaceRoleManager.name
      )
      return managers.length > 1
    },

    $_ocCollaborators_deleteShare_trigger(share) {
      const modal = {
        variation: 'danger',
        title: this.$gettext('Remove share'),
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Remove'),
        icon: 'alarm-warning',
        message: this.$gettext('Are you sure you want to remove this share?'),
        hasInput: false,
        onCancel: this.hideModal,
        onConfirm: () => this.$_ocCollaborators_deleteShare(share)
      }

      this.createModal(modal)
    },

    $_ocCollaborators_deleteShare(share) {
      this.deleteShare({
        client: this.$client,
        graphClient: this.graphClient,
        share: share,
        resource: this.highlightedFile
      })
        .then(() => {
          this.hideModal()
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
        })
        .catch((error) => {
          console.error(error)
          this.showMessage({
            title: this.$gettext('Failed to remove share'),
            status: 'danger'
          })
        })
    }
  }
})
</script>

<style>
.avatars-wrapper {
  height: 40px;
}
</style>

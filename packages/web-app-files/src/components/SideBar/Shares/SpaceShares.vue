<template>
  <div id="oc-files-sharing-sidebar" class="oc-position-relative">
    <oc-loader v-if="sharesLoading" :aria-label="$gettext('Loading members')" />
    <template v-else>
      <invite-collaborator-form v-if="currentUserCanShare" key="new-collaborator" class="oc-my-s" />
      <template v-if="hasCollaborators">
        <ul
          id="files-collaborators-list"
          class="oc-list oc-list-divider oc-overflow-hidden oc-m-rm"
          :aria-label="$gettext('Share receivers')"
        >
          <li v-for="collaborator in currentFileOutgoingCollaborators" :key="collaborator.key">
            <collaborator-list-item
              :share="collaborator"
              :modifiable="isModifiable(collaborator)"
              @onDelete="$_ocCollaborators_deleteShare(collaborator)"
            />
          </li>
        </ul>
      </template>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex'
import { useStore } from 'web-pkg/src/composables'
import { clientService } from 'web-pkg/src/services'
import CollaboratorListItem from './Collaborators/ListItem.vue'
import InviteCollaboratorForm from './InviteCollaborator/InviteCollaboratorForm.vue'
import { spaceRoleManager } from '../../../helpers/share'
import { createLocationSpaces, isLocationSpacesActive } from '../../../router'
import { useTask } from 'vue-concurrency'

export default {
  title: ($gettext) => {
    return $gettext('Members')
  },
  name: 'SpaceShares',
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
        client: graphClient,
        path: ref.space.id,
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
    sharesLoading() {
      return this.currentFileOutgoingSharesLoading
    },
    hasCollaborators() {
      return this.currentFileOutgoingCollaborators.length > 0
    },
    currentUserCanShare() {
      return this.currentUserIsManager
    },
    currentUserIsManager() {
      const currentUserCollaborator = this.currentFileOutgoingCollaborators.find(
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

    isModifiable(share) {
      if (!this.currentUserIsManager) {
        return false
      }

      if (share.role.name !== spaceRoleManager.name) {
        return true
      }

      // forbid to remove last manager of a space
      const managers = this.currentFileOutgoingCollaborators.filter(
        (collaborator) => collaborator.role.name === spaceRoleManager.name
      )
      return managers.length > 1
    },
    $_ocCollaborators_deleteShare(share) {
      this.deleteShare({
        client: this.$client,
        graphClient: this.graphClient,
        share: share,
        resource: this.highlightedFile
      }).then(() => {
        // current user was removed from the share.
        if (share.collaborator.name === this.user.id) {
          if (isLocationSpacesActive(this.$router, 'files-spaces-projects')) {
            return this.$router.go()
          }
          return this.$router.push(createLocationSpaces('files-spaces-projects'))
        }
      })
    }
  }
}
</script>

<style>
.avatars-wrapper {
  height: 40px;
}
</style>

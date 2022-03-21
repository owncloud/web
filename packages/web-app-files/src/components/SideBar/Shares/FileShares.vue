<template>
  <div id="oc-files-sharing-sidebar" class="oc-position-relative">
    <oc-loader v-if="sharesLoading" :aria-label="$gettext('Loading people list')" />
    <template v-else>
      <invite-collaborator-form v-if="currentUserCanShare" key="new-collaborator" class="oc-my-s" />
      <p
        v-else
        key="no-reshare-permissions-message"
        data-testid="files-collaborators-no-reshare-permissions-message"
        v-text="noResharePermsMessage"
      />
      <div v-if="hasSharees" class="avatars-wrapper oc-flex oc-flex-middle oc-flex-between">
        <h4 class="oc-text-initial oc-text-bold oc-my-rm" v-text="sharedWithLabel" />
        <oc-button
          v-oc-tooltip="sharedWithTooltip"
          data-testid="collaborators-show-people"
          appearance="raw"
          :aria-label="sharedWithTooltip"
          @click="toggleShareeList"
        >
          <oc-avatars
            v-if="!showShareesList"
            :items="collaboratorsAvatar"
            :stacked="true"
            :is-tooltip-displayed="false"
            class="sharee-avatars"
          />
          <oc-icon v-else name="arrow-up-s" />
        </oc-button>
      </div>
      <template v-if="showShareesList && hasSharees">
        <ul
          id="files-collaborators-list"
          class="oc-list oc-list-divider oc-overflow-hidden"
          :class="{ 'oc-mb-l': showSpaceMembers, 'oc-m-rm': !showSpaceMembers }"
          :aria-label="$gettext('Share receivers')"
        >
          <li v-for="collaborator in collaborators" :key="collaborator.key">
            <collaborator-list-item
              :share="collaborator"
              :modifiable="!collaborator.indirect"
              :shared-parent-route="getSharedParentRoute(collaborator)"
              @onDelete="$_ocCollaborators_deleteShare"
            />
          </li>
        </ul>
      </template>
      <template v-if="showSpaceMembers">
        <h4 class="oc-text-initial oc-text-bold oc-my-s" v-text="spaceMemberLabel" />
        <ul
          id="space-collaborators-list"
          class="oc-list oc-list-divider oc-overflow-hidden oc-m-rm"
          :aria-label="spaceMemberLabel"
        >
          <li v-for="collaborator in spaceMembers" :key="collaborator.key">
            <collaborator-list-item :share="collaborator" :modifiable="false" />
          </li>
        </ul>
      </template>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex'
import { watch, computed } from '@vue/composition-api'
import { useStore, useDebouncedRef } from 'web-pkg/src/composables'
import { textUtils } from '../../../helpers/textUtils'
import { getParentPaths } from '../../../helpers/path'
import { dirname } from 'path'
import InviteCollaboratorForm from './InviteCollaborator/InviteCollaboratorForm.vue'
import CollaboratorListItem from './Collaborators/ListItem.vue'
import { ShareTypes } from '../../../helpers/share'
import { clientService } from 'web-pkg/src/services'
import { useTask } from 'vue-concurrency'
import { buildSpace, buildSpaceShare } from '../../../helpers/resources'
import { sortSpaceMembers } from '../../../helpers/space'
import { createLocationSpaces, isLocationSpacesActive } from '../../../router'

export default {
  name: 'FileShares',
  components: {
    InviteCollaboratorForm,
    CollaboratorListItem
  },
  setup() {
    const store = useStore()
    const currentFileOutgoingSharesLoading = computed(
      () => store.getters['Files/currentFileOutgoingSharesLoading']
    )
    const incomingSharesLoading = computed(() => store.state.Files.incomingSharesLoading)
    const sharesTreeLoading = computed(() => store.state.Files.sharesTreeLoading)
    const sharesLoading = useDebouncedRef(true, 250)
    watch([currentFileOutgoingSharesLoading, incomingSharesLoading, sharesTreeLoading], () => {
      sharesLoading.value =
        currentFileOutgoingSharesLoading.value ||
        incomingSharesLoading.value ||
        sharesTreeLoading.value
    })

    const graphClient = clientService.graphAuthenticated(
      store.getters.configuration.server,
      store.getters.getToken
    )

    const loadSpaceTask = useTask(function* (signal, ref, storageId) {
      const graphResponse = yield graphClient.drives.getDrive(storageId)

      if (!graphResponse.data) {
        return
      }

      ref.currentSpace = buildSpace(graphResponse.data)
    })

    const loadSpaceMembersTask = useTask(function* (signal, ref) {
      const promises = []
      const spaceShares = []

      for (const role of Object.keys(ref.currentSpace.spaceRoles)) {
        for (const userId of ref.currentSpace.spaceRoles[role]) {
          promises.push(
            graphClient.users.getUser(userId).then((resolved) => {
              spaceShares.push(buildSpaceShare({ ...resolved.data, role }, ref.currentSpace.id))
            })
          )
        }
      }

      yield Promise.all(promises).then(() => {
        ref.spaceMembers = sortSpaceMembers(spaceShares)
      })
    })

    return { sharesLoading, loadSpaceTask, loadSpaceMembersTask }
  },
  title: ($gettext) => {
    return $gettext('People')
  },
  data() {
    return {
      currentShare: null,
      showShareesList: true,
      currentSpace: null,
      spaceMembers: []
    }
  },
  computed: {
    ...mapGetters('Files', ['highlightedFile', 'currentFileOutgoingCollaborators']),
    ...mapState('Files', ['incomingShares', 'sharesTree']),
    ...mapState(['user']),

    sharedWithLabel() {
      return this.$gettext('Shared with')
    },
    spaceMemberLabel() {
      return this.$gettext('Space members')
    },

    hasSharees() {
      return this.collaboratorsAvatar.length > 0
    },

    sharedWithTooltip() {
      return this.showShareesList
        ? this.$gettext('Collapse list of invited people')
        : this.$gettext('Show all invited people')
    },

    collaboratorsAvatar() {
      return this.collaborators.map((c) => {
        return {
          ...c.collaborator,
          shareType: c.shareType
        }
      })
    },

    /**
     * Returns all incoming shares, direct and indirect
     *
     * @return {Array.<Object>} list of incoming shares
     */
    $_allIncomingShares() {
      // direct incoming shares
      const allShares = [...this.incomingShares]

      // indirect incoming shares
      const parentPaths = getParentPaths(this.highlightedFile.path, true)
      if (parentPaths.length === 0) {
        return []
      }

      // remove root entry
      parentPaths.pop()

      parentPaths.forEach((parentPath) => {
        const shares = this.sharesTree[parentPath]
        if (shares) {
          shares.forEach((share) => {
            if (share.incoming) {
              allShares.push(share)
            }
          })
        }
      })

      return allShares
    },

    collaborators() {
      return [...this.currentFileOutgoingCollaborators, ...this.indirectOutgoingShares]
        .sort(this.collaboratorsComparator)
        .map((collaborator) => {
          collaborator.key = 'collaborator-' + collaborator.id
          if (
            collaborator.owner.name !== collaborator.fileOwner.name &&
            collaborator.owner.name !== this.user.id
          ) {
            collaborator.resharers = [collaborator.owner]
          }
          return collaborator
        })
    },

    indirectOutgoingShares() {
      const allShares = []
      const parentPaths = getParentPaths(this.highlightedFile.path, false)
      if (parentPaths.length === 0) {
        return []
      }

      // remove root entry
      parentPaths.pop()

      parentPaths.forEach((parentPath) => {
        const shares = this.sharesTree[parentPath]
        if (shares) {
          shares.forEach((share) => {
            if (share.outgoing && this.$_isCollaboratorShare(share)) {
              share.key = 'indirect-collaborator-' + share.id
              allShares.push(share)
            }
          })
        }
      })

      return allShares
    },

    currentUserCanShare() {
      return this.highlightedFile.canShare({ user: this.user })
    },
    noResharePermsMessage() {
      const translatedFile = this.$gettext("You don't have permission to share this file.")
      const translatedFolder = this.$gettext("You don't have permission to share this folder.")
      return this.highlightedFile.type === 'file' ? translatedFile : translatedFolder
    },

    currentUsersPermissions() {
      if (this.$_allIncomingShares.length > 0) {
        let permissions = 0

        for (const share of this.$_allIncomingShares) {
          permissions |= share.permissions
        }

        return permissions
      }

      return null
    },
    currentUserIsMemberOfSpace() {
      return this.currentSpace?.spaceMemberIds.includes(this.user.uuid)
    },
    showSpaceMembers() {
      return (
        this.currentSpace &&
        this.highlightedFile.type !== 'space' &&
        this.currentUserIsMemberOfSpace
      )
    }
  },
  watch: {
    highlightedFile: {
      handler: function (newItem, oldItem) {
        if (oldItem !== newItem) {
          this.$_reloadShares()
          this.showShareesList = true
        }
      },
      immediate: true
    }
  },
  async mounted() {
    if (this.$route.params.storageId) {
      await this.loadSpaceTask.perform(this, this.$route.params.storageId)

      if (this.showSpaceMembers) {
        this.loadSpaceMembersTask.perform(this)
      }
    }
  },
  methods: {
    ...mapActions('Files', [
      'loadCurrentFileOutgoingShares',
      'loadSharesTree',
      'deleteShare',
      'loadIncomingShares'
    ]),
    $_isCollaboratorShare(collaborator) {
      return ShareTypes.containsAnyValue(ShareTypes.authenticated, [collaborator.shareType])
    },
    collaboratorsComparator(c1, c2) {
      // Sorted by: type, direct, display name, creation date
      const c1DisplayName = c1.collaborator ? c1.collaborator.displayName : c1.displayName
      const c2DisplayName = c2.collaborator ? c2.collaborator.displayName : c2.displayName
      const name1 = c1DisplayName.toLowerCase().trim()
      const name2 = c2DisplayName.toLowerCase().trim()
      const c1UserShare = ShareTypes.containsAnyValue(ShareTypes.individuals, [c1.shareType])
      const c2UserShare = ShareTypes.containsAnyValue(ShareTypes.individuals, [c2.shareType])
      const c1DirectShare = !c1.indirect
      const c2DirectShare = !c2.indirect

      if (c1UserShare === c2UserShare) {
        if (c1DirectShare === c2DirectShare) {
          if (name1 === name2) {
            return textUtils.naturalSortCompare(c1.stime + '', c2.stime + '')
          }

          return textUtils.naturalSortCompare(name1, name2)
        }

        return c1DirectShare ? -1 : 1
      }

      return c1UserShare ? -1 : 1
    },
    toggleShareeList() {
      this.showShareesList = !this.showShareesList
    },
    $_ocCollaborators_deleteShare(share) {
      this.deleteShare({
        client: this.$client,
        share: share,
        resource: this.highlightedFile,
        storageId: this.$route.params.storageId
      })
    },
    $_reloadShares() {
      this.loadCurrentFileOutgoingShares({
        client: this.$client,
        path: this.highlightedFile.path,
        $gettext: this.$gettext,
        storageId: this.$route.params.storageId
      })
      this.loadIncomingShares({
        client: this.$client,
        path: this.highlightedFile.path,
        $gettext: this.$gettext,
        storageId: this.$route.params.storageId
      })
      this.loadSharesTree({
        client: this.$client,
        path: dirname(this.highlightedFile.path),
        $gettext: this.$gettext,
        storageId: this.$route.params.storageId
      })
    },
    getSharedParentRoute(parentShare) {
      if (!parentShare.indirect) {
        return null
      }

      if (this.sharesTree[parentShare.path]) {
        if (isLocationSpacesActive(this.$router, 'files-spaces-project')) {
          return createLocationSpaces('files-spaces-project', {
            params: { storageId: this.$route.params.storageId, item: parentShare.path }
          })
        }

        return createLocationSpaces('files-spaces-personal-home', {
          params: { item: parentShare.path }
        })
      }

      return null
    }
  }
}
</script>

<style>
.avatars-wrapper {
  height: 40px;
}
</style>

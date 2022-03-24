<template>
  <div id="new-collaborators-form" data-testid="new-collaborators-form">
    <oc-select
      id="files-share-invite-input"
      ref="ocSharingAutocomplete"
      v-model="selectedCollaborators"
      :options="autocompleteResults"
      :loading="searchInProgress"
      :multiple="true"
      :filter="filterRecipients"
      :label="selectedCollaboratorsLabel"
      aria-describedby="files-share-invite-hint"
      :dropdown-should-open="
        ({ open, search }) => open && search.length >= minSearchLength && !searchInProgress
      "
      @search:input="onSearch"
      @input="resetFocusOnInvite"
    >
      <template #option="option">
        <autocomplete-item :item="option" />
      </template>
      <template #no-options>
        <translate> No users or groups found. </translate>
      </template>
      <template #selected-option-container="{ option, deselect }">
        <recipient-container
          :key="option.value.shareWith"
          :recipient="option"
          :deselect="deselect"
        />
      </template>
      <template #open-indicator>
        <!-- Empty to hide the caret -->
        <span />
      </template>
    </oc-select>
    <p
      id="files-share-invite-hint"
      class="oc-mt-xs oc-text-meta"
      v-text="inviteDescriptionMessage"
    />
    <div class="oc-flex oc-flex-middle oc-flex-between oc-mb-l">
      <role-dropdown
        :resource="highlightedFile"
        :allow-share-permission="hasResharing || resourceIsSpace"
        @optionChange="collaboratorRoleChanged"
      />
      <expiration-datepicker
        :share-types="selectedCollaborators.map((c) => c.value.shareType)"
        @optionChange="collaboratorExpiryChanged"
      />
      <oc-button v-if="saving" key="new-collaborator-saving-button" :disabled="true">
        <oc-spinner :aria-label="$gettext('Creating share')" size="small" />
        <span v-translate :aria-hidden="true">Share</span>
      </oc-button>
      <oc-button
        v-else
        id="new-collaborators-form-create-button"
        key="new-collaborator-save-button"
        data-testid="new-collaborators-form-create-button"
        :disabled="!$_isValid"
        variation="primary"
        appearance="filled"
        submit="submit"
        @click="share"
        v-text="$gettext('Share')"
      />
    </div>
    <oc-hidden-announcer level="assertive" :announcement="announcement" />
  </div>
</template>

<script>
import debounce from 'lodash-es/debounce'
import PQueue from 'p-queue'

import { mapActions, mapGetters } from 'vuex'

import AutocompleteItem from './AutocompleteItem.vue'
import RoleDropdown from '../RoleDropdown.vue'
import RecipientContainer from './RecipientContainer.vue'
import ExpirationDatepicker from './ExpirationDatepicker.vue'
import {
  PeopleShareRoles,
  SharePermissions,
  ShareTypes,
  SpacePeopleShareRoles
} from '../../../../helpers/share'
import { clientService } from 'web-pkg/src/services'
import { useCapabilityFilesSharingResharing } from 'web-pkg/src/composables'

export default {
  name: 'InviteCollaboratorForm',
  components: {
    AutocompleteItem,
    RoleDropdown,
    RecipientContainer,
    ExpirationDatepicker
  },
  setup() {
    return {
      hasResharing: useCapabilityFilesSharingResharing()
    }
  },
  data() {
    return {
      autocompleteResults: [],
      announcement: '',
      searchInProgress: false,
      selectedCollaborators: [],
      selectedRole: null,
      customPermissions: null,
      saving: false,
      expirationDate: null,
      searchQuery: ''
    }
  },
  computed: {
    ...mapGetters('Files', ['currentFileOutgoingCollaborators', 'highlightedFile']),
    ...mapGetters(['configuration', 'getToken', 'user']),

    inviteDescriptionMessage() {
      return this.$gettext('Add new person by name, email or federation IDs')
    },

    $_announcementWhenCollaboratorAdded() {
      return this.$gettext('Person was added')
    },

    $_isValid() {
      return this.selectedCollaborators.length > 0
    },

    minSearchLength() {
      return parseInt(this.user.capabilities.files_sharing.search_min_length, 10)
    },
    selectedCollaboratorsLabel() {
      return this.$gettext('Invite')
    },

    resourceIsSpace() {
      return this.highlightedFile.type === 'space'
    },
    graphClient() {
      return clientService.graphAuthenticated(this.configuration.server, this.getToken)
    }
  },
  mounted() {
    this.fetchRecipients = debounce(this.fetchRecipients, 500)

    this.selectedRole = this.resourceIsSpace
      ? SpacePeopleShareRoles.list()[0]
      : PeopleShareRoles.list(this.highlightedFile.isFolder)[0]
  },

  methods: {
    ...mapActions('Files', ['addShare']),

    async fetchRecipients(query) {
      try {
        const recipients = await this.$client.shares.getRecipients(
          query,
          'folder',
          1,
          this.configuration.options.sharingRecipientsPerPage
        )

        const shareType = this.resourceIsSpace ? ShareTypes.space.value : ShareTypes.user.value
        const users = recipients.exact.users
          .concat(recipients.users)
          .filter((user) => user.value.shareWith !== this.user.id)
          .map((result) => {
            // Inject the correct share type here as the response has always type "user"
            return { ...result, value: { ...result.value, shareType } }
          })
        const groups = recipients.exact.groups.concat(recipients.groups)
        const remotes = recipients.exact.remotes.concat(recipients.remotes)

        this.autocompleteResults = users.concat(groups, remotes).filter((collaborator) => {
          const selected = this.selectedCollaborators.find((selectedCollaborator) => {
            return (
              collaborator.value.shareWith === selectedCollaborator.value.shareWith &&
              parseInt(collaborator.value.shareType, 10) ===
                parseInt(selectedCollaborator.value.shareType, 10)
            )
          })

          const exists = this.currentFileOutgoingCollaborators.find((existingCollaborator) => {
            return (
              collaborator.value.shareWith === existingCollaborator.collaborator.name &&
              parseInt(collaborator.value.shareType, 10) === existingCollaborator.shareType
            )
          })

          if (selected || exists) {
            return false
          }

          this.announcement = this.$_announcementWhenCollaboratorAdded

          return true
        })
      } catch (error) {
        console.error(error)
      }

      this.searchInProgress = false
    },

    onSearch(query) {
      this.autocompleteResults = []
      this.searchQuery = query

      if (query.length < this.minSearchLength) {
        this.searchInProgress = false

        return
      }

      this.searchInProgress = true

      this.fetchRecipients(query)
    },

    filterRecipients(recipients, query) {
      if (recipients.length < 1) {
        return []
      }

      // Allow advanced queries
      query = query.split(':')[1] || query

      return recipients.filter(
        (recipient) =>
          recipient.value.shareType === ShareTypes.remote.value ||
          recipient.label.toLocaleLowerCase().indexOf(query.toLocaleLowerCase()) > -1 ||
          recipient.value.shareWith.toLocaleLowerCase().indexOf(query.toLocaleLowerCase()) > -1 ||
          (recipient.value.shareWithAdditionalInfo || '')
            .toLocaleLowerCase()
            .indexOf(query.toLocaleLowerCase()) > -1
      )
    },

    collaboratorRoleChanged({ role, permissions }) {
      this.selectedRole = role
      this.customPermissions = permissions
    },

    collaboratorExpiryChanged({ expirationDate }) {
      this.expirationDate = expirationDate
    },

    async share() {
      this.saving = true

      const saveQueue = new PQueue({ concurrency: 4 })
      const savePromises = []
      this.selectedCollaborators.forEach((collaborator) => {
        savePromises.push(
          saveQueue.add(() => {
            const bitmask = this.selectedRole.hasCustomPermissions
              ? SharePermissions.permissionsToBitmask(this.customPermissions)
              : SharePermissions.permissionsToBitmask(
                  this.selectedRole.permissions(this.hasResharing || this.resourceIsSpace)
                )

            let storageId
            if (this.resourceIsSpace) {
              storageId = this.highlightedFile.id
            } else if (this.$route.params.storageId) {
              storageId = this.$route.params.storageId
            }

            this.addShare({
              client: this.$client,
              graphClient: this.graphClient,
              path: this.highlightedFile.path,
              $gettext: this.$gettext,
              shareWith: collaborator.value.shareWith,
              displayName: collaborator.label,
              shareType: collaborator.value.shareType,
              permissions: bitmask,
              expirationDate: this.expirationDate,
              storageId
            })
          })
        )
      })

      await Promise.all(savePromises)
      this.selectedCollaborators = []
      this.saving = false
    },

    resetFocusOnInvite() {
      this.autocompleteResults = []
      this.$nextTick(() => {
        const inviteInput = document.getElementById('files-share-invite-input')

        inviteInput.focus()
      })
    }
  }
}
</script>

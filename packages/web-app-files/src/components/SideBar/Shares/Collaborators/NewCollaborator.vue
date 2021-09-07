<template>
  <div class="files-collaborators-collaborator-add-dialog">
    <div class="oc-mb">
      <label for="files-share-invite-input" v-text="$gettext('Invite')" />
      <oc-select
        id="files-share-invite"
        ref="ocSharingAutocomplete"
        v-model="selectedCollaborators"
        :options="autocompleteResults"
        :loading="searchInProgress"
        :multiple="true"
        :filter="filterRecipients"
        input-id="files-share-invite-input"
        aria-describedby="files-share-invite-hint"
        :dropdown-should-open="
          ({ open, search }) => open && search.length >= minSearchLength && !searchInProgress
        "
        @search:input="onSearch"
        @input="onInviteInput"
      >
        <template #option="option">
          <autocomplete-item :item="option" />
        </template>
        <template #no-options>
          <translate>
            No users or groups found.
          </translate>
        </template>
        <template #selected-option-container="{ option, deselect }">
          <recipient-container :recipient="option" :deselect="deselect" />
        </template>
        <template #open-indicator>
          <!-- Empty to hide the caret -->
          <span />
        </template>
      </oc-select>
      <p
        id="files-share-invite-hint"
        class="oc-mt-xs oc-mb-rm oc-text-meta"
        v-text="inviteDescriptionMessage"
      />
    </div>
    <collaborators-edit-options class="oc-mb" @optionChange="collaboratorOptionChanged" />
    <oc-grid gutter="small" class="oc-mb">
      <div>
        <oc-button
          key="new-collaborator-cancel-button"
          :disabled="saving"
          class="files-collaborators-collaborator-cancel"
          @click="$_ocCollaborators_newCollaboratorsCancel"
        >
          <translate>Cancel</translate>
        </oc-button>
      </div>
      <div>
        <oc-button v-if="saving" key="new-collaborator-saving-button" :disabled="true">
          <oc-spinner :aria-label="$gettext('Adding People')" size="small" />
          <span v-translate :aria-hidden="true">Adding People</span>
        </oc-button>
        <oc-button
          v-else
          id="files-collaborators-collaborator-save-new-share-button"
          key="new-collaborator-save-button"
          :disabled="!$_isValid"
          variation="primary"
          appearance="filled"
          @click="share"
        >
          <translate>Share</translate>
        </oc-button>
      </div>
    </oc-grid>
    <oc-hidden-announcer level="assertive" :announcement="announcement" />
  </div>
</template>

<script>
import debounce from 'lodash-es/debounce'
import PQueue from 'p-queue'

import { mapActions, mapGetters } from 'vuex'
import Mixins from '../../../../mixins/collaborators'
import { roleToBitmask } from '../../../../helpers/collaborators'
import { shareTypes } from '../../../../helpers/shareTypes'

import AutocompleteItem from './AutocompleteItem.vue'
import CollaboratorsEditOptions from './CollaboratorsEditOptions.vue'
import RecipientContainer from './RecipientContainer.vue'

export default {
  name: 'NewCollaborator',
  components: {
    AutocompleteItem,
    CollaboratorsEditOptions,
    RecipientContainer
  },
  mixins: [Mixins],
  data() {
    return {
      autocompleteResults: [],
      announcement: '',
      searchInProgress: false,
      selectedCollaborators: [],
      selectedRole: null,
      additionalPermissions: null,
      saving: false,
      expirationDate: null,
      searchQuery: ''
    }
  },
  computed: {
    ...mapGetters('Files', ['currentFileOutgoingCollaborators', 'highlightedFile']),
    ...mapGetters(['user']),
    ...mapGetters(['configuration']),

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
    }
  },
  mounted() {
    this.focusInviteInput()

    this.fetchRecipients = debounce(this.fetchRecipients, 500)
  },

  methods: {
    ...mapActions('Files', ['addShare']),

    close() {
      this.$emit('close')
    },

    async fetchRecipients(query) {
      try {
        const recipients = await this.$client.shares.getRecipients(
          query,
          'folder',
          1,
          this.configuration.options.sharingRecipientsPerPage
        )
        const users = recipients.exact.users
          .concat(recipients.users)
          .filter(user => user.value.shareWith !== this.user.id)
        const groups = recipients.exact.groups.concat(recipients.groups)
        const remotes = recipients.exact.remotes.concat(recipients.remotes)

        this.autocompleteResults = users.concat(groups, remotes).filter(collaborator => {
          const selected = this.selectedCollaborators.find(selectedCollaborator => {
            return (
              collaborator.value.shareWith === selectedCollaborator.value.shareWith &&
              parseInt(collaborator.value.shareType, 10) ===
                parseInt(selectedCollaborator.value.shareType, 10)
            )
          })

          const exists = this.currentFileOutgoingCollaborators.find(existingCollaborator => {
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

      return recipients.filter(
        recipient =>
          recipient.value.shareType === shareTypes.remote ||
          recipient.label.toLocaleLowerCase().indexOf(query.toLocaleLowerCase()) > -1 ||
          recipient.value.shareWith.toLocaleLowerCase().indexOf(query.toLocaleLowerCase()) > -1 ||
          (recipient.value.shareWithAdditionalInfo || '')
            .toLocaleLowerCase()
            .indexOf(query.toLocaleLowerCase()) > -1
      )
    },
    $_ocCollaborators_newCollaboratorsCancel() {
      this.selectedCollaborators = []
      this.saving = false
      this.close()
    },
    async share() {
      this.saving = true

      const saveQueue = new PQueue({ concurrency: 4 })
      const savePromises = []
      this.selectedCollaborators.forEach(collaborator => {
        savePromises.push(
          saveQueue.add(() =>
            this.addShare({
              client: this.$client,
              path: this.highlightedFile.path,
              $gettext: this.$gettext,
              shareWith: collaborator.value.shareWith,
              shareType: collaborator.value.shareType,
              permissions: roleToBitmask(this.selectedRole, this.additionalPermissions),
              expirationDate: this.expirationDate
            })
          )
        )
      })

      await Promise.all(savePromises)
      this.$_ocCollaborators_newCollaboratorsCancel()
    },
    $_ocCollaborators_removeFromSelection(collaborator) {
      this.selectedCollaborators = this.selectedCollaborators.filter(selectedCollaborator => {
        return collaborator !== selectedCollaborator
      })
    },

    focusInviteInput() {
      this.$nextTick(() => {
        const inviteInput = document.getElementById('files-share-invite-input')

        inviteInput.focus()
      })
    },

    onInviteInput() {
      this.autocompleteResults = []
      this.focusInviteInput()
    }
  }
}
</script>

<style lang="scss" scoped>
.files-share-invite-recipient {
  margin: 4px 2px 0;
  padding: 0 0.25em;
}
</style>

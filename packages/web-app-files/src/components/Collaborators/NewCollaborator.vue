<template>
  <div class="files-collaborators-collaborator-add-dialog">
    <oc-autocomplete
      id="oc-sharing-autocomplete"
      ref="ocSharingAutocomplete"
      :label="$gettext('Select a person to add')"
      :items="autocompleteResults"
      :items-loading="autocompleteInProgress"
      :description-message="$_ocCollaborationStatus_autocompleteDescriptionMessage"
      :filter="filterRecipients"
      :fill-on-selection="false"
      class="uk-width-1-1 oc-mb"
      dropdown-class="uk-width-1-1"
      @input="$_ocCollaborators_selectAutocompleteResult"
      @update:input="$_onAutocompleteInput"
    >
      <template v-slot:item="{ item }">
        <autocomplete-item :item="item" />
      </template>
    </oc-autocomplete>
    <div v-if="selectedCollaborators.length > 0">
      <h4 v-translate class="oc-text-initial oc-mb-rm">Selected people</h4>
      <ul class="uk-list files-collaborators-collaborator-autocomplete-items oc-mt-s oc-mb-m">
        <li
          v-for="collaborator in selectedCollaborators"
          :key="collaborator.value.shareWith + '-' + collaborator.value.shareType"
          class="uk-flex files-collaborators-collaborator-autocomplete-item"
        >
          <oc-button
            :aria-label="$gettext('Delete share')"
            appearance="raw"
            size="small"
            class="files-collaborators-collaborator-autocomplete-item-remove oc-mr-xs"
            @click="$_ocCollaborators_removeFromSelection(collaborator)"
          >
            <oc-icon name="close" />
          </oc-button>
          <autocomplete-item :item="collaborator" />
        </li>
      </ul>
    </div>
    <collaborators-edit-options class="oc-mb" @optionChange="collaboratorOptionChanged" />
    <hr class="divider" />
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
import { mapActions, mapGetters } from 'vuex'
import Mixins from '../../mixins/collaborators'
import { roleToBitmask } from '../../helpers/collaborators'

import AutocompleteItem from './AutocompleteItem.vue'
import { shareTypes } from '../../helpers/shareTypes'
import CollaboratorsEditOptions from './CollaboratorsEditOptions.vue'
import PQueue from 'p-queue'

export default {
  name: 'NewCollaborator',
  components: {
    AutocompleteItem,
    CollaboratorsEditOptions
  },
  mixins: [Mixins],
  data() {
    return {
      autocompleteResults: [],
      announcement: '',
      autocompleteInProgress: false,
      selectedCollaborators: [],
      selectedRole: null,
      additionalPermissions: null,
      saving: false,
      expirationDate: null
    }
  },
  computed: {
    ...mapGetters('Files', ['currentFileOutgoingCollaborators', 'highlightedFile']),
    ...mapGetters(['user']),

    $_ocCollaborationStatus_autocompleteDescriptionMessage() {
      return this.$gettext("Add new person by name, email or federation ID's")
    },

    $_announcementWhenCollaboratorAdded() {
      return this.$gettext('Person was added')
    },

    $_isValid() {
      return this.selectedCollaborators.length > 0
    }
  },
  mounted() {
    // Ensure default role is not undefined
    this.$nextTick(() => {
      this.$refs.ocSharingAutocomplete.focus()
    })

    this.$_onAutocompleteInput = debounce(this.$_onAutocompleteInput, 1000)
  },

  methods: {
    ...mapActions('Files', ['addShare']),

    close() {
      this.$emit('close')
    },

    $_onAutocompleteInput(value) {
      const minSearchLength = parseInt(this.user.capabilities.files_sharing.search_min_length, 10)
      if (value.length < minSearchLength) {
        this.autocompleteInProgress = false
        this.autocompleteResults = []
        return
      }
      this.autocompleteInProgress = true
      this.autocompleteResults = []
      // TODO: move to store
      this.$client.shares
        .getRecipients(value, 'folder')
        .then(recipients => {
          this.autocompleteInProgress = false
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
        })
        .catch(error => {
          console.log(error)
          this.autocompleteInProgress = false
        })
    },
    filterRecipients(item, queryText) {
      if (item.value.shareType === shareTypes.remote) {
        // done on server side
        return true
      }
      return (
        item.label.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) > -1 ||
        item.value.shareWith.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) > -1 ||
        (item.value.shareWithAdditionalInfo || '')
          .toLocaleLowerCase()
          .indexOf(queryText.toLocaleLowerCase()) > -1
      )
    },
    $_ocCollaborators_newCollaboratorsCancel() {
      this.selectedCollaborators = []
      this.saving = false
      this.close()
    },
    share() {
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

      return Promise.all(savePromises).then(() => {
        this.$_ocCollaborators_newCollaboratorsCancel()
      })
    },
    $_ocCollaborators_selectAutocompleteResult(collaborator) {
      this.selectedCollaborators.push(collaborator)
    },
    $_ocCollaborators_removeFromSelection(collaborator) {
      this.selectedCollaborators = this.selectedCollaborators.filter(selectedCollaborator => {
        return collaborator !== selectedCollaborator
      })
    }
  }
}
</script>

<template>
  <div class="files-collaborators-collaborator-add-dialog">
    <label for="oc-sharing-autocomplete" class="oc-mb-s uk-display-block">
      <translate>Add People:</translate>
      <oc-autocomplete
        id="oc-sharing-autocomplete"
        ref="ocSharingAutocomplete"
        :aria-label="$gettext('Select a person to add')"
        :items="autocompleteResults"
        :items-loading="autocompleteInProgress"
        :placeholder="$_ocCollaborationStatus_autocompletePlaceholder"
        :filter="filterRecipients"
        :fill-on-selection="false"
        class="uk-width-1-1"
        dropdown-class="uk-width-1-1"
        @input="$_ocCollaborators_selectAutocompleteResult"
        @update:input="$_onAutocompleteInput"
      >
        <template v-slot:item="{ item }">
          <autocomplete-item :item="item" />
        </template>
      </oc-autocomplete>
    </label>
    <oc-grid v-if="selectedCollaborators.length > 0" gutter="small">
      <div>
        <div>
          <translate>Selected people:</translate>
        </div>
        <oc-table-simple class="uk-width-expand files-collaborators-collaborator-autocomplete-item">
          <oc-tr
            v-for="collaborator in selectedCollaborators"
            :key="collaborator.value.shareWith + '-' + collaborator.value.shareType"
          >
            <oc-td width="shrink">
              <oc-button
                :aria-label="$gettext('Delete share')"
                variation="raw"
                size="small"
                class="files-collaborators-collaborator-autocomplete-item-remove"
                @click="$_ocCollaborators_removeFromSelection(collaborator)"
              >
                <oc-icon name="close" />
              </oc-button>
            </oc-td>
            <oc-td>
              <autocomplete-item :item="collaborator" />
            </oc-td>
          </oc-tr>
        </oc-table-simple>
      </div>
    </oc-grid>
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
          @click="$_ocCollaborators_newCollaboratorsAdd(selectedCollaborators)"
        >
          <translate>Share</translate>
        </oc-button>
      </div>
    </oc-grid>
    <oc-hidden-announcer level="assertive" :announcement="announcement" />
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import { mapActions, mapGetters } from 'vuex'
import Mixins from '../../mixins/collaborators'
import { roleToBitmask } from '../../helpers/collaborators'

import AutocompleteItem from './AutocompleteItem.vue'
import { shareTypes } from '../../helpers/shareTypes'

const CollaboratorsEditOptions = () => import('./CollaboratorsEditOptions.vue')
const { default: PQueue } = require('p-queue')

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

    $_ocCollaborationStatus_autocompletePlaceholder() {
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
          let users = recipients.exact.users.concat(recipients.users)
          const groups = recipients.exact.groups.concat(recipients.groups)
          users = users.filter(user => {
            return user.value.shareWith !== this.user.id
          })
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
        item.value.shareWith.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) > -1
      )
    },
    $_ocCollaborators_newCollaboratorsCancel() {
      this.selectedCollaborators = []
      this.saving = false
      this.close()
    },
    $_ocCollaborators_newCollaboratorsAdd(collaborators) {
      this.saving = true

      const saveQueue = new PQueue({ concurrency: 4 })
      const savePromises = []
      collaborators.forEach(collaborator => {
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

<style scoped="scoped">
/* FIXME: Move to ODS somehow */
.files-collaborators-collaborator-autocomplete-item td {
  padding: 0 10px 10px 0;
}
</style>

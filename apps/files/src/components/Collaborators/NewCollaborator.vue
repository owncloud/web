<template>
  <div class="files-collaborators-collaborator-add-dialog">
    <label for="oc-sharing-autocomplete"><translate>New Collaborators:</translate></label>
    <oc-grid gutter="small">
      <oc-autocomplete
        @input="$_ocCollaborators_selectAutocompleteResult"
        :ariaLabel="$gettext('Select a collaborator to add')"
        :items="autocompleteResults"
        :itemsLoading="autocompleteInProgress"
        :placeholder="$_ocCollaborationStatus_autocompletePlacholder"
        @update:input="$_onAutocompleteInput"
        :filter="filterRecipients"
        :fillOnSelection="false"
        id="oc-sharing-autocomplete"
        ref="ocSharingAutocomplete"
        class="uk-width-1-1"
        dropdownClass="uk-width-1-1"
      >
        <template v-slot:item="{ item }">
          <autocomplete-item :item="item" />
        </template>
      </oc-autocomplete>
    </oc-grid>
    <oc-grid gutter="small">
      <div
        v-if="selectedCollaborators.length > 0"
      >
        <div>
          <div>
            <translate>Selected collaborators</translate>:
          </div>
          <div
            v-for="(collaborator, index) in selectedCollaborators"
            :key="collaborator.label"
            class="uk-flex-inline uk-flex-row uk-flex-start uk-margin-small-bottom"
            :class="{
              'uk-margin-small-right': index + 1 !== selectedCollaborators.length
            }"
          >
            <div class="uk-margin-small-top">
              <span class="uk-text-bold" v-text="collaborator.label" />
              <span v-if="collaborator.value.shareType === 1" class="uk-text-meta">
                (<translate>group</translate>)
              </span>
            </div>
            <oc-button :ariaLabel="$gettext('Delete share')" variation="raw" class="oc-cursor-pointer"  @click="$_ocCollaborators_removeFromSelection(collaborator)">
              <oc-icon
                name="close"
                variation="danger"
              />
            </oc-button>
          </div>
        </div>
      </div>
    </oc-grid>
    <hr class="divider" />
    <collaborators-edit-options class="uk-margin-bottom" @optionChange="collaboratorOptionChanged" />
    <hr class="divider" />
    <oc-grid gutter="small" class="uk-margin-bottom">
      <div>
        <oc-button class="files-collaborators-collaborator-cancel" @click="$_ocCollaborators_newCollaboratorsCancel">
          <translate>Cancel</translate>
        </oc-button>
        <oc-button
          id="files-collaborators-collaborator-save-new-share-button"
          variation="primary"
          :disabled="!selectedCollaborators.length"
          @click="$_ocCollaborators_newCollaboratorsAdd(selectedCollaborators)"
        >
          <translate>Add collaborators</translate>
        </oc-button>
      </div>
    </oc-grid>
    <oc-hidden-announcer level="assertive" :announcement="announcement" />
  </div>
</template>

<script>
import _ from 'lodash'
import { mapActions, mapGetters } from 'vuex'
import Mixins from '../../mixins/collaborators'
import { roleToBitmask } from '../../helpers/collaborators'

import AutocompleteItem from './AutocompleteItem.vue'
const CollaboratorsEditOptions = () => import('./CollaboratorsEditOptions.vue')

export default {
  name: 'NewCollaborator',
  components: {
    AutocompleteItem,
    CollaboratorsEditOptions
  },
  mixins: [Mixins],
  data () {
    return {
      autocompleteResults: [],
      announcement: '',
      announcementWhenCollaboratorAdded: this.$gettext('Collaborator was added'),
      autocompleteInProgress: false,
      selectedCollaborators: [],
      selectedRole: null,
      additionalPermissions: null
    }
  },
  computed: {
    ...mapGetters('Files', [
      'shares',
      'highlightedFile'
    ]),
    ...mapGetters(['user']),

    $_ocCollaborationStatus_autocompletePlacholder () {
      return this.$gettext(
        "Add new collaborator by name, email or federation ID's"
      )
    }
  },
  mounted () {
    // Ensure default role is not undefined
    this.$nextTick(() => {
      this.$refs.ocSharingAutocomplete.focus()
    })

    this.$_onAutocompleteInput = _.debounce(this.$_onAutocompleteInput, 1000)
  },

  methods: {
    ...mapActions('Files', [
      'shareSetOpen',
      'loadShares',
      'sharesClearState',
      'addShare',
      'deleteShare',
      'changeShare',
      'toggleCollaboratorsEdit'
    ]),

    close () {
      this.$emit('close')
    },

    $_onAutocompleteInput (value) {
      if (
        value.length <
        parseInt(this.user.capabilities.files_sharing.search_min_length, 10)
      ) {
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

          const results = users.concat(groups, remotes).filter(collaborator => {
            const selected = this.selectedCollaborators.find(
              selectedCollaborator => {
                return (
                  collaborator.value.shareWith ===
                  selectedCollaborator.value.shareWith
                )
              }
            )

            const exists = this.shares.find(existingCollaborator => {
              return (
                collaborator.value.shareWith === existingCollaborator.name &&
                parseInt(collaborator.value.shareType, 10) === parseInt(existingCollaborator.info.share_type, 10)
              )
            })

            if (selected || exists) {
              return false
            }

            this.announcement = this.announcementWhenCollaboratorAdded
            return true
          })

          this.autocompleteResults = results
        })
        .catch(error => {
          console.log(error)
          this.autocompleteInProgress = false
        })
    },
    filterRecipients (item, queryText) {
      if (item.value.shareType === 6) {
        // done on server side
        return true
      }
      return (
        item.label.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) >
          -1 ||
        item.value.shareWith
          .toLocaleLowerCase()
          .indexOf(queryText.toLocaleLowerCase()) > -1
      )
    },
    $_ocCollaborators_newCollaboratorsCancel () {
      this.selectedCollaborators = []
      this.toggleCollaboratorsEdit(false)
      this.close()
    },
    $_ocCollaborators_newCollaboratorsAdd (collaborators) {
      for (const collaborator of collaborators) {
        this.addShare({
          client: this.$client,
          path: this.highlightedFile.path,
          $gettext: this.$gettext,
          shareWith: collaborator.value.shareWith,
          shareType: collaborator.value.shareType,
          permissions: roleToBitmask(this.selectedRole, this.additionalPermissions, this.highlightedFile.type === 'folder')
        })
      }
      this.selectedCollaborators = []
      this.toggleCollaboratorsEdit(false)
      this.close()
    },
    $_ocCollaborators_selectAutocompleteResult (collaborator) {
      this.selectedCollaborators.push(collaborator)
      this.toggleCollaboratorsEdit(true)
    },
    $_ocCollaborators_removeFromSelection (collaborator) {
      const selectedCollaborators = this.selectedCollaborators.filter(
        selectedCollaborator => {
          return collaborator !== selectedCollaborator
        }
      )

      this.selectedCollaborators = selectedCollaborators

      if (this.selectedCollaborators.length < 1) {
        this.toggleCollaboratorsEdit(false)
      }
    }
  }
}
</script>

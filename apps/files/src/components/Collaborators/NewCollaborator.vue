<template>
  <div>
    <oc-autocomplete
      @input="$_ocCollaborators_selectAutocompleteResult"
      :items="autocompleteResults"
      :itemsLoading="autocompleteInProgress"
      :placeholder="$_ocCollaborationStatus_autocompletePlacholder"
      @update:input="onAutocompleteInput"
      :filter="filterRecipients"
      id="oc-sharing-autocomplete"
      class="uk-margin-bottom"
      :disabled="collaboratorsEditInProgress && selectedCollaborators.length < 1"
      dropdownClass="uk-width-1-1"
    >
      <template v-slot:item="{ item }">
        <autocomplete-item :item="item" />
      </template>
    </oc-autocomplete>
    <div
      v-if="selectedCollaborators.length > 0"
      class="uk-margin-medium-bottom"
    >
      <div>
        <div><translate>Selected collaborators</translate>:</div>
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
          <oc-icon
            name="close"
            variation="danger"
            class="oc-cursor-pointer"
            role="button"
            @click="$_ocCollaborators_removeFromSelection(collaborator)"
          />
        </div>
      </div>
      <collaborators-edit-options class="uk-margin-bottom" @optionChange="collaboratorOptionChanged" />
      <div class="uk-flex uk-flex-between">
        <oc-button @click="$_ocCollaborators_newCollaboratorsCancel">
          <translate>Cancel</translate>
        </oc-button>
        <oc-button
          id="files-collaborators-add-new-button"
          variation="primary"
          @click="addCollaborators(selectedCollaborators)"
        >
          <translate>Add collaborators</translate>
        </oc-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import Mixins from '../../mixins/collaborators'
import { roleToBitmask } from '../../helpers/collaborators'

import AutocompleteItem from './AutocompleteItem.vue'
const CollaboratorsEditOptions = () => import('./CollaboratorsEditOptions.vue')

export default {
  name: 'NewCollaborator',
  mixins: [Mixins],
  components: {
    AutocompleteItem,
    CollaboratorsEditOptions
  },
  data () {
    return {
      autocompleteResults: [],
      autocompleteInProgress: false,
      selectedCollaborators: [],
      selectedRole: null,
      additionalPermissions: null
    }
  },
  computed: {
    ...mapGetters('Files', [
      'shares',
      'highlightedFile',
      'collaboratorsEditInProgress'
    ]),
    ...mapGetters(['user']),

    $_ocCollaborationStatus_autocompletePlacholder () {
      return this.$gettext(
        "Add new collaborator by name, email or federation ID's"
      )
    }
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

    onAutocompleteInput (value) {
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
              return collaborator.value.shareWith === existingCollaborator.name
            })

            if (selected || exists) {
              return false
            }

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
        return (
          item.label
            .toLocaleLowerCase()
            .indexOf(queryText.toLocaleLowerCase()) > -1 &&
          item.label.indexOf('@') > -1 &&
          item.label.indexOf('.') > -1 &&
          item.label.lastIndexOf('.') + 1 !== item.label.length
        )
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
      this.selectedNewRole = this.defaultRole
    },
    addCollaborators (collaborators) {
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
        this.selectedNewRole = this.defaultRole
      }
    }
  }
}
</script>

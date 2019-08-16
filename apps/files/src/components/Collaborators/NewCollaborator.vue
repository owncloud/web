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
      >
        <template v-slot:item="{item}">
          <autocomplete-item :item="item" />
        </template>
      </oc-autocomplete>
      <div v-if="selectedCollaborators.length > 0" class="uk-margin-medium-bottom">
        <div>
          <div>
            <translate>Selected collaborators</translate>:
          </div>
          <div
            v-for="(collaborator, index) in selectedCollaborators"
            :key="index"
            class="uk-flex-inline uk-flex-row uk-flex-start uk-margin-small-bottom"
            :class="{ 'uk-margin-small-right': (index + 1) !== selectedCollaborators.length }"
          >
            <div class="uk-margin-small-top">
              <span class="uk-text-bold">{{ collaborator.label }}</span>
              <translate v-if="collaborator.value.shareType" class="uk-text-meta">(group)</translate>
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
        <div>
          <oc-grid gutter="small">
            <div class="uk-width-1-1">
              <label class="oc-label">
                <translate>Role</translate>
              </label>
              <oc-button
                id="files-collaborators-role-button"
                class="uk-width-1-1 files-collaborators-role-button"
              >
                <span v-if="!selectedNewRole">Select role</span>
                <template v-else>{{ selectedNewRole.name }}</template>
              </oc-button>
              <p
                v-if="selectedNewRole"
                class="uk-text-meta uk-margin-remove"
              >{{ selectedNewRole.description }}</p>
              <oc-drop
                closeOnClick
                dropId="files-collaborators-roles-dropdown"
                toggle="#files-collaborators-role-button"
                mode="click"
                :options="{ offset: 0, delayHide: 0 }"
                class="oc-autocomplete-dropdown"
              >
                <ul class="oc-autocomplete-suggestion-list">
                  <li
                    v-for="(role, key) in roles"
                    :key="key"
                    :id="`files-collaborator-new-collaborator-role-${role.tag}`"
                    class="oc-autocomplete-suggestion"
                    :class="{ 'oc-autocomplete-suggestion-selected' : selectedNewRole === role }"
                    @click="$_ocCollaborators_newCollaboratorsSelectRole(role)"
                  >
                    <span class="uk-text-bold">{{ role.name }}</span>
                    <p class="uk-text-meta uk-margin-remove">{{ role.description }}</p>
                  </li>
                </ul>
              </oc-drop>
            </div>
            <div v-if="false" class="uk-width-1-1">
              <label class="oc-label">
                <translate>Expiration date</translate>
                <translate class="uk-text-meta uk-remove-margin">(optional)</translate>
              </label>
              <oc-text-input type="date" class="uk-width-1-1 oc-button-role">04 - 07 - 2019</oc-text-input>
            </div>
            <oc-grid v-if="selectedNewRole" gutter="small" class="uk-width-1-1">
              <div class="uk-flex uk-flex-row uk-flex-wrap uk-flex-middle">
                <oc-switch
                  class="uk-margin-small-right"
                  @change="$_ocCollaborators_switchPermission('canShare')"
                />
                <translate :class="{ 'uk-text-muted': !canShare }">Can share</translate>
              </div>
              <template v-if="selectedNewRole.tag === 'custom'">
                <div class="uk-flex uk-flex-row uk-flex-wrap uk-flex-middle">
                  <oc-switch
                    class="uk-margin-small-right"
                    @change="$_ocCollaborators_switchPermission('canChange')"
                  />
                  <translate :class="{ 'uk-text-muted': !canChange }">Can change</translate>
                </div>
                <div
                  v-if="highlightedFile.type === 'folder'"
                  class="uk-flex uk-flex-row uk-flex-wrap uk-flex-middle"
                >
                  <oc-switch
                    class="uk-margin-small-right"
                    @change="$_ocCollaborators_switchPermission('canCreate')"
                  />
                  <translate :class="{ 'uk-text-muted': !canCreate }">Can create</translate>
                </div>
                <div
                  v-if="highlightedFile.type === 'folder'"
                  class="uk-flex uk-flex-row uk-flex-wrap uk-flex-middle"
                >
                  <oc-switch
                    class="uk-margin-small-right"
                    @change="$_ocCollaborators_switchPermission('canDelete')"
                  />
                  <translate :class="{ 'uk-text-muted': !canDelete }">Can delete</translate>
                </div>
              </template>
            </oc-grid>
            <div>
              <oc-button @click="$_ocCollaborators_newCollaboratorsCancel">
                <translate>Cancel</translate>
              </oc-button>
            </div>
            <div>
              <oc-button
                id="files-collaborators-add-new-button"
                variation="primary"
                @click="$_ocCollaborators_newCollaboratorsAdd(selectedCollaborators)"
                :disabled="!selectedNewRole"
              >
                <translate>Add collaborators</translate>
              </oc-button>
            </div>
          </oc-grid>
        </div>
      </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import Mixins from './mixins'

import AutocompleteItem from './AutocompleteItem.vue'

export default {
  name: 'NewCollaborator',
  mixins: [Mixins],
  components: {
    AutocompleteItem
  },
  data () {
    return {
      autocompleteResults: [],
      autocompleteInProgress: false,
      selectedCollaborators: [],
      canShare: false,
      canChange: false,
      canCreate: false,
      canDelete: false,
      selectedNewRole: null
    }
  },
  computed: {
    ...mapGetters('Files', ['shares', 'highlightedFile', 'collaboratorsEditInProgress']),
    ...mapGetters(['user']),

    $_ocCollaborationStatus_autocompletePlacholder () {
      return this.$gettext("Add new collaborator by name, email or federation ID's")
    }
  },
  methods: {
    ...mapActions('Files', ['shareSetOpen', 'loadShares', 'sharesClearState',
      'addShare', 'deleteShare', 'changeShare', 'toggleCollaboratorsEdit']),

    onAutocompleteInput (value) {
      if (value.length < parseInt(this.user.capabilities.files_sharing.search_min_length, 10)) {
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

          const results = users.concat(groups).filter(collaborator => {
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
    },
    $_ocCollaborators_newCollaboratorsSelectRole (role) {
      this.selectedNewRole = role
    },
    $_ocCollaborators_newCollaboratorsAdd (collaborators) {
      const params = { permissions: null }
      switch (this.selectedNewRole.tag) {
        case 'viewer':
          params.permissions = this.canShare ? 17 : 1
          break
        case 'editor':
          if (this.highlightedFile.type === 'folder') {
            params.permissions = this.canShare ? 31 : 15
            break
          }
          params.permissions = this.canShare ? 19 : 3
          break
        case 'custom':
          let perms = 1
          const changePerm = 2
          const createPerm = 4
          const deletePerm = 8
          const resharePerm = 16
          if (this.canChange) perms += changePerm
          if (this.canCreate) perms += createPerm
          if (this.canDelete) perms += deletePerm
          if (this.canShare) perms += resharePerm
          params.permissions = perms
          break
      }
      for (const collaborator of collaborators) {
        this.addShare({
          client: this.$client,
          path: this.highlightedFile.path,
          $gettext: this.$gettext,
          shareWith: collaborator.value.shareWith,
          shareType: collaborator.value.shareType,
          permissions: params
        })
      }
      this.selectedCollaborators = []
      this.selectedNewRole = null
      this.canChange = false
      this.canCreate = false
      this.canDelete = false
      this.canShare = false
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

      if (this.selectedCollaborators.length < 1) this.toggleCollaboratorsEdit(false)
    }
  }
}
</script>

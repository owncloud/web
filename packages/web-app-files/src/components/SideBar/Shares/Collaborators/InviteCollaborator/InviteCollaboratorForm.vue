<template>
  <div id="new-collaborators-form" data-testid="new-collaborators-form">
    <br />
    <div class="oc-flex">
      <oc-select
        id="account-type-input"
        v-model="accountType"
        :options="accountTypes"
        :label="'Account type'"
        class="account-type-input"
      >
        <template #option="{ prefix, description }">
          <span class="option oc-text-xsmall" v-text="description" />
        </template>
        <template #selected-option="{ description }">
          <span class="option oc-text-xsmall" v-text="description" />
        </template>
      </oc-select>
      <oc-select
        id="files-share-invite-input"
        ref="ocSharingAutocomplete"
        :model-value="selectedCollaborators"
        :options="autocompleteResults"
        :loading="searchInProgress"
        :multiple="true"
        :filter="filterRecipients"
        :label="selectedCollaboratorsLabel"
        class="files-share-invite-input"
        aria-describedby="files-share-invite-hint"
        :dropdown-should-open="
          ({ open, search }) => open && search.length >= minSearchLength && !searchInProgress
        "
        @search:input="onSearch"
        @update:model-value="resetFocusOnInvite"
      >
        <template #option="option">
          <autocomplete-item :item="option" />
        </template>
        <template #no-options>
          <span v-text="$gettext('No users or groups found.')" />
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
    </div>

    <div class="oc-flex oc-flex-middle oc-flex-between oc-mb-l oc-mt-s">
      <role-dropdown
        :allow-share-permission="hasResharing || resourceIsSpace"
        @option-change="collaboratorRoleChanged"
      />
      <expiration-datepicker
        v-if="!saving"
        :share-types="selectedCollaborators.map((c) => c.value.shareType)"
        @option-change="collaboratorExpiryChanged"
      />
      <oc-checkbox v-model="notifyEnabled" :value="false" label="Notify via mail" />
      <oc-button v-if="saving" key="new-collaborator-saving-button" :disabled="true">
        <oc-spinner :aria-label="$gettext('Creating share')" size="small" />
        <span :aria-hidden="true" v-text="$gettext(saveButtonLabel)" />
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
        v-text="$gettext(saveButtonLabel)"
      />
    </div>
    <oc-hidden-announcer level="assertive" :announcement="announcement" />
  </div>
</template>

<script lang="ts">
import { debounce } from 'lodash-es'
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
} from 'web-client/src/helpers/share'
import {
  useCapabilityFilesSharingAllowCustomPermissions,
  useCapabilityFilesSharingCanDenyAccess,
  useCapabilityFilesSharingResharing,
  useCapabilityFilesSharingResharingDefault,
  useCapabilityShareJailEnabled,
  useStore
} from 'web-pkg/src/composables'

import { useGraphClient } from 'web-pkg/src/composables'
import { defineComponent, inject } from 'vue'
import { Resource } from 'web-client'

// just a dummy function to trick gettext tools
const $gettext = (str) => {
  return str
}

export default defineComponent({
  name: 'InviteCollaboratorForm',
  components: {
    AutocompleteItem,
    RoleDropdown,
    RecipientContainer,
    ExpirationDatepicker
  },
  props: {
    saveButtonLabel: {
      type: String,
      required: false,
      default: () => $gettext('Share')
    },
    inviteLabel: {
      type: String,
      required: false,
      default: ''
    }
  },

  setup() {
    const store = useStore()
    return {
      resource: inject<Resource>('resource'),
      hasResharing: useCapabilityFilesSharingResharing(store),
      resharingDefault: useCapabilityFilesSharingResharingDefault(store),
      hasShareJail: useCapabilityShareJailEnabled(store),
      hasRoleCustomPermissions: useCapabilityFilesSharingAllowCustomPermissions(store),
      hasRoleDenyAccess: useCapabilityFilesSharingCanDenyAccess(store),
      ...useGraphClient()
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
      searchQuery: '',
      notifyEnabled: false,
      formData: new URLSearchParams(),
      accountType: { prefix: '', description: 'standard' },
      accountTypes: [
        { prefix: '', description: 'standard', default: true },
        { prefix: 'a:', description: 'secondary' },
        { prefix: 'a:', description: 'service' },
        { prefix: 'l:', description: 'guest' },
        { prefix: 'sm:', description: 'federated' }
      ]
    }
  },
  computed: {
    ...mapGetters('Files', ['currentFileOutgoingCollaborators']),
    ...mapGetters('runtime/spaces', ['spaceMembers']),
    ...mapGetters(['configuration', 'user', 'capabilities']),

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
      return this.inviteLabel || this.$gettext('Invite')
    },

    resourceIsSpace() {
      return this.resource.type === 'space'
    }
  },
  watch: {
    selectedCollaborators(newCollaborators, oldCollaborators) {
      if (newCollaborators.length === oldCollaborators.length + 1) {
        const defaultAccountType = this.accountTypes.find((e) => e.default)
        if (defaultAccountType) this.accountType = defaultAccountType
      }
    },

    accountType() {
      const inviteInput = document.getElementById('files-share-invite-input')
      inviteInput.focus()
    }
  },
  mounted() {
    this.fetchRecipients = debounce(this.fetchRecipients, 500)

    if (this.resourceIsSpace) {
      this.selectedRole = SpacePeopleShareRoles.list()[0]
    } else {
      const canDeny = this.resource.canDeny() && this.hasRoleDenyAccess
      this.selectedRole = PeopleShareRoles.list(
        this.resource.isFolder,
        this.hasRoleCustomPermissions,
        canDeny
      )[0]
    }
  },

  methods: {
    ...mapActions('Files', ['addShare']),
    ...mapActions('runtime/spaces', ['addSpaceMember']),

    async fetchRecipients(query) {
      try {
        const recipients = await this.$client.shares.getRecipients(
          query,
          'folder',
          1,
          this.configuration?.options?.sharingRecipientsPerPage
        )

        const users = recipients.exact.users
          .concat(recipients.users)
          .filter((user) => user.value.shareWith !== this.user.id)
          .map((result) => {
            if (this.resourceIsSpace) {
              result.value.shareType = ShareTypes.spaceUser.value
            }
            return result
          })
        const groups = recipients.exact.groups.concat(recipients.groups).map((result) => {
          if (this.resourceIsSpace) {
            result.value.shareType = ShareTypes.spaceGroup.value
          }
          return result
        })
        const remotes = recipients.exact.remotes.concat(recipients.remotes)

        this.autocompleteResults = [...users, ...groups, ...remotes].filter((collaborator) => {
          const selected = this.selectedCollaborators.find((selectedCollaborator) => {
            return (
              collaborator.value.shareWith === selectedCollaborator.value.shareWith &&
              parseInt(collaborator.value.shareType) ===
                parseInt(selectedCollaborator.value.shareType)
            )
          })

          const existingShares = this.resourceIsSpace
            ? this.spaceMembers
            : this.currentFileOutgoingCollaborators
          const exists = existingShares.find((share) => {
            const shareCollaboratorIdentifier =
              share.collaborator.name || share.collaborator.displayName
            const isSameByIdentifier = collaborator.value.shareWith === shareCollaboratorIdentifier
            const isSameByType = parseInt(collaborator.value.shareType) === share.shareType
            return isSameByIdentifier && isSameByType
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
      const prefix = this.accountType?.prefix
      if (
        prefix &&
        this.accountTypes
          .filter((t) => t.prefix.length > 0)
          .some((t) => {
            return query.startsWith(t.prefix)
          })
      )
        this.fetchRecipients(query)
      else if (prefix) this.fetchRecipients(prefix + query)
      else this.fetchRecipients(query)
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

      this.selectedCollaborators.forEach((collaborator, i) => {
        savePromises.push(
          saveQueue.add(() => {
            const collaborators = this.selectedCollaborators
            const bitmask = this.selectedRole.hasCustomPermissions
              ? SharePermissions.permissionsToBitmask(this.customPermissions)
              : SharePermissions.permissionsToBitmask(
                  this.selectedRole.permissions(
                    (this.hasResharing && this.resharingDefault) || this.resourceIsSpace
                  )
                )

            let path = this.resource.path
            // sharing a share root from the share jail -> use resource name as path
            if (this.hasShareJail && path === '/') {
              path = `/${this.resource.name}`
            }

            // put filter: "sm:"

            const addMethod = this.resourceIsSpace ? this.addSpaceMember : this.addShare
            addMethod({
              ...this.$language,
              client: this.$client,
              graphClient: this.graphClient,
              path,
              shareWith: collaborator.value.shareWith,
              shareWithUser: collaborator.value.shareWith,
              shareWithProvider: collaborator.value.shareWithProvider,
              displayName: collaborator.label,
              shareType: collaborator.value.shareType,
              permissions: bitmask,
              role: this.selectedRole,
              expirationDate: this.expirationDate,
              storageId: this.resource.fileId || this.resource.id,
              notify: this.notifyEnabled
            })
          })
        )
      })

      await Promise.all(savePromises)
      this.selectedCollaborators = []
      this.saving = false
    },

    resetFocusOnInvite(event) {
      this.selectedCollaborators = event
      this.autocompleteResults = []
      this.$nextTick(() => {
        const inviteInput = document.getElementById('files-share-invite-input')

        inviteInput.focus()
      })
    }
  }
})
</script>

<style scoped>
.files-share-invite-input {
  width: 70%;
}
.account-type-input {
  width: 30%;
}
</style>
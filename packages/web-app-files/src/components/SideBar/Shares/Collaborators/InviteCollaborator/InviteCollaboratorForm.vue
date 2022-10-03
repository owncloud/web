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
        <translate v-if="resourceIsSpace"> No users found. </translate>
        <translate v-else> No users or groups found. </translate>
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
    <div class="oc-flex oc-flex-middle oc-flex-between oc-mb-l oc-mt-s">
      <role-dropdown
        :resource="highlightedFile"
        :allow-share-permission="hasResharing || resourceIsSpace"
        @optionChange="collaboratorRoleChanged"
      />
      <expiration-datepicker
        :share-types="selectedCollaborators.map((c) => c.value.shareType)"
        @optionChange="collaboratorExpiryChanged"
      />
      <oc-checkbox v-model="notifyEnabled" :value="false" label="Notify via mail" />
      <oc-button v-if="saving" key="new-collaborator-saving-button" :disabled="true">
        <oc-spinner :aria-label="$gettext('Creating share')" size="small" />
        <span v-translate :aria-hidden="true" v-text="saveButtonLabel" />
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
} from 'web-client/src/helpers/share'
import {
  useCapabilityFilesSharingResharing,
  useCapabilityShareJailEnabled
} from 'web-pkg/src/composables'

import { defineComponent } from '@vue/runtime-core'

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
    return {
      hasResharing: useCapabilityFilesSharingResharing(),
      hasShareJail: useCapabilityShareJailEnabled()
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
      formData: new URLSearchParams()
    }
  },
  computed: {
    ...mapGetters('Files', ['currentFileOutgoingCollaborators', 'highlightedFile']),
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
      return this.highlightedFile.type === 'space'
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
            // Inject the correct share type here if space
            const shareType = this.resourceIsSpace ? ShareTypes.space.value : result.value.shareType
            return {
              ...result,
              value: {
                ...result.value,
                shareType
              }
            }
          })

        let groups = []
        if (!this.resourceIsSpace) {
          groups = recipients.exact.groups.concat(recipients.groups)
        }

        const remotes = recipients.exact.remotes.concat(recipients.remotes)

        this.autocompleteResults = users.concat(groups, remotes).filter((collaborator) => {
          const selected = this.selectedCollaborators.find((selectedCollaborator) => {
            return (
              collaborator.value.shareWith === selectedCollaborator.value.shareWith &&
              parseInt(collaborator.value.shareType, 10) ===
                parseInt(selectedCollaborator.value.shareType, 10)
            )
          })

          const existingShares = this.resourceIsSpace
            ? this.spaceMembers
            : this.currentFileOutgoingCollaborators
          const exists = existingShares.find((existingCollaborator) => {
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

      this.selectedCollaborators.forEach((collaborator, i) => {
        savePromises.push(
          saveQueue.add(() => {
            const collaborators = this.selectedCollaborators
            const bitmask = this.selectedRole.hasCustomPermissions
              ? SharePermissions.permissionsToBitmask(this.customPermissions)
              : SharePermissions.permissionsToBitmask(
                  this.selectedRole.permissions(this.hasResharing || this.resourceIsSpace)
                )

            let path = this.highlightedFile.path
            // sharing a share root from the share jail -> use resource name as path
            if (this.hasShareJail && path === '/') {
              path = `/${this.highlightedFile.name}`
            }

            const addMethod = this.resourceIsSpace ? this.addSpaceMember : this.addShare
            addMethod({
              client: this.$client,
              path,
              $gettext: this.$gettext,
              shareWith: collaborator.value.shareWith,
              displayName: collaborator.label,
              shareType: collaborator.value.shareType,
              permissions: bitmask,
              role: this.selectedRole,
              expirationDate: this.expirationDate,
              storageId: this.highlightedFile.fileId || this.highlightedFile.id
            }).then((share) => {
              if (this.notifyEnabled && share?.shareInfo?.id) {
                this.formData.append('id', share.shareInfo.id)
                if (Array.from(this.formData.keys()).length === collaborators.length) {
                  this.notify()
                  this.formData = new URLSearchParams()
                }
              }
            })
          })
        )
      })
      await Promise.all(savePromises)

      this.selectedCollaborators = []
      this.saving = false
    },

    async notify() {
      const url = `/mailer`
      const accessToken = this.$store.getters['runtime/auth/accessToken']
      const headers = new Headers()
      headers.append('Authorization', 'Bearer ' + accessToken)
      headers.append('X-Requested-With', 'XMLHttpRequest')
      headers.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: this.formData.toString()
      })
      if (!response.ok) {
        this.showMessage({
          title: this.$gettext('An error occurred'),
          desc: this.$gettext('Email notification could not be sent '),
          status: 'danger'
        })
      } else {
        const recipients = await response.json()
        if (recipients.recipients)
          this.showMessage({
            title: this.$gettext('Success'),
            desc: this.$gettext(
              `Email notification was sent to ${JSON.stringify(recipients.recipients)
                .replace(/[[\]]/g, '')
                .replaceAll('"', '')}`
            ),
            status: 'success'
          })
      }
    },

    resetFocusOnInvite() {
      this.autocompleteResults = []
      this.$nextTick(() => {
        const inviteInput = document.getElementById('files-share-invite-input')

        inviteInput.focus()
      })
    }
  }
})
</script>

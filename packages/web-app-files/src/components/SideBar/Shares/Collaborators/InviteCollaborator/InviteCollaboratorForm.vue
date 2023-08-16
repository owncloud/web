<template>
  <div id="new-collaborators-form" data-testid="new-collaborators-form">
    <oc-select
      id="files-share-invite-input"
      ref="ocSharingAutocomplete"
      :model-value="selectedCollaborators"
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
    <div class="oc-flex oc-flex-between oc-mb-l oc-mt-s">
      <role-dropdown
        :allow-share-permission="hasResharing || resourceIsSpace"
        mode="create"
        class="role-selection-dropdown"
        @option-change="collaboratorRoleChanged"
      />
      <div class="oc-flex">
        <div v-if="formattedExpirationDate" class="oc-flex">
          <oc-icon
            v-oc-tooltip="formattedExpirationDate"
            class="files-collaborators-collaborator-expiration"
            data-testid="recipient-info-expiration-date"
            :aria-label="formattedExpirationDate"
            name="calendar-event"
            fill-type="line"
          />
          <span class="oc-invisible-sr" v-text="screenreaderShareExpiration" />
        </div>
        <oc-button
          id="show-more-actions-btn"
          :aria-label="$gettext('Show more actions')"
          appearance="raw"
        >
          <oc-icon name="more-2" />
          <oc-drop
            :drop-id="'show-more-actions-btn'"
            :toggle="'#show-more-actions-btn'"
            mode="click"
            padding-size="small"
          >
            <oc-list
              class="collaborator-edit-dropdown-options-list"
              :aria-label="'shareEditOptions'"
            >
              <li class="oc-rounded oc-menu-item-hover">
                <expiration-datepicker
                  v-if="!saving"
                  :share-types="selectedCollaborators.map((c) => c.value.shareType)"
                  @option-change="collaboratorExpiryChanged"
                />
              </li>
            </oc-list>
          </oc-drop>
        </oc-button>
        <oc-button
          id="new-collaborators-form-create-button"
          key="new-collaborator-save-button"
          data-testid="new-collaborators-form-create-button"
          :disabled="!$_isValid || saving"
          :variation="saving ? 'passive' : 'primary'"
          :appearance="saving ? 'outline' : 'filled'"
          submit="submit"
          :show-spinner="savingDelayed"
          @click="share"
        >
          <span v-text="$gettext(saveButtonLabel)" />
        </oc-button>
      </div>
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
  useCapabilityFilesSharingResharing,
  useCapabilityFilesSharingResharingDefault,
  useCapabilityShareJailEnabled,
  useClientService,
  useStore
} from 'web-pkg/src/composables'

import { defineComponent, inject, ref, unref, watch } from 'vue'
import { Resource } from 'web-client'
import { useShares } from 'web-app-files/src/composables'
import ContextMenuQuickAction from 'web-pkg/src/components/ContextActions/ContextMenuQuickAction.vue'
import {
  displayPositionedDropdown,
  formatDateFromDateTime,
  formatRelativeDateFromDateTime
} from 'web-pkg'
import { DateTime } from 'luxon'

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
    const clientService = useClientService()
    const saving = ref(false)
    const savingDelayed = ref(false)

    watch(saving, (newValue) => {
      if (!newValue) {
        savingDelayed.value = false
        return
      }
      setTimeout(() => {
        if (!unref(saving)) {
          savingDelayed.value = false
          return
        }
        savingDelayed.value = true
      }, 700)
    })

    const contextMenuButtonRef = ref(undefined)

    const showContextMenuOnBtnClick = (data, user) => {
      const { dropdown, event } = data
      if (dropdown?.tippy === undefined) {
        return
      }
      displayPositionedDropdown(dropdown.tippy, event, unref(contextMenuButtonRef))
    }

    const isExpirationDateSet = false
    const enteredExpirationDate = {}

    return {
      resource: inject<Resource>('resource'),
      hasResharing: useCapabilityFilesSharingResharing(store),
      resharingDefault: useCapabilityFilesSharingResharingDefault(store),
      hasShareJail: useCapabilityShareJailEnabled(store),
      hasRoleCustomPermissions: useCapabilityFilesSharingAllowCustomPermissions(store),
      clientService,
      saving,
      savingDelayed,
      ...useShares(),
      showContextMenuOnBtnClick,
      contextMenuButtonRef,
      isExpirationDateSet,
      enteredExpirationDate
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
      expirationDate: null,
      searchQuery: ''
    }
  },
  computed: {
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
      return this.inviteLabel || this.$gettext('Search')
    },

    resourceIsSpace() {
      return this.resource.type === 'space'
    },
    formattedExpirationDate() {
      return this.expirationDate === null
        ? null
        : formatDateFromDateTime(
            DateTime.fromISO(this.expirationDate).endOf('day'),
            this.$language.current
          )
    },
    expirationDateRelative() {
      return formatRelativeDateFromDateTime(
        DateTime.fromIso(this.expirationDate).endOf('day'),
        this.$language.current
      )
    },
    screenreaderShareExpiration() {
      return this.$gettext('Share expires %{ expiryDateRelative } (%{ expiryDate })', {
        expiryDateRelative: this.expirationDateRelative,
        expiryDate: this.expirationDate
      })
    }
  },
  mounted() {
    this.fetchRecipients = debounce(this.fetchRecipients, 500)

    if (this.resourceIsSpace) {
      this.selectedRole = SpacePeopleShareRoles.list()[0]
    } else {
      this.selectedRole = PeopleShareRoles.list(
        this.resource.isFolder,
        this.hasRoleCustomPermissions
      )[0]
    }
  },

  methods: {
    $gettext,
    ...mapActions(['showMessage', 'showErrorMessage']),
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
            : this.outgoingCollaborators.filter((c) => !c.indirect)
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
      const errors = []

      const saveQueue = new PQueue({ concurrency: 4 })
      const savePromises = []
      this.selectedCollaborators.forEach((collaborator) => {
        savePromises.push(
          saveQueue.add(async () => {
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

            const addMethod = this.resourceIsSpace ? this.addSpaceMember : this.addShare

            try {
              await addMethod({
                client: this.$client,
                graphClient: this.clientService.graphAuthenticated,
                path,
                shareWith: collaborator.value.shareWith,
                displayName: collaborator.label,
                shareType: collaborator.value.shareType,
                permissions: bitmask,
                role: this.selectedRole,
                expirationDate: this.expirationDate,
                storageId: this.resource.fileId || this.resource.id
              })
            } catch (e) {
              console.error(e)
              errors.push({
                displayName: collaborator.label,
                error: e
              })
              throw e
            }
          })
        )
      })

      const results = await Promise.allSettled(savePromises)

      if (results.length !== errors.length) {
        this.showMessage({ title: this.$gettext('Share was added successfully') })
      }
      errors.forEach((e) => {
        this.showErrorMessage({
          title: this.$gettext('Failed to add share for "%{displayName}"', {
            displayName: e.displayName
          }),
          error: e.error
        })
      })

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
<style lang="scss">
.role-selection-dropdown {
  max-width: 150px;
}

#new-collaborators-form-create-button {
  padding-left: 30px;
  padding-right: 30px;
}

#show-more-actions-btn {
  margin-left: $oc-space-small;
  margin-right: $oc-space-small;
}

oc-datepicker {
  width: 100%;
}
</style>

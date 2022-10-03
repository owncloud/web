<template>
  <div
    :data-testid="`collaborator-${isUser || isSpace ? 'user' : 'group'}-item-${
      share.collaborator.name
    }`"
    class="files-collaborators-collaborator oc-py-xs"
  >
    <div class="oc-width-1-1 oc-flex oc-flex-middle files-collaborators-collaborator-details">
      <div class="oc-width-2-3 oc-flex oc-flex-middle">
        <div>
          <avatar-image
            v-if="isUser || isSpace"
            :userid="share.collaborator.name"
            :user-name="share.collaborator.displayName"
            :width="36"
            class="files-collaborators-collaborator-indicator"
          />
          <oc-avatar-item
            v-else
            :width="36"
            icon-size="medium"
            :icon="shareTypeIcon"
            :name="shareTypeKey"
            class="files-collaborators-collaborator-indicator"
          />
        </div>
        <div class="oc-pl-s oc-text-truncate">
          <div v-oc-tooltip="shareDisplayNameTooltip" class="oc-text-truncate">
            <span
              aria-hidden="true"
              class="files-collaborators-collaborator-name"
              v-text="shareDisplayName"
            />
            <span class="oc-invisible-sr" v-text="screenreaderShareDisplayName" />
          </div>
          <div>
            <div v-if="canEditOrDelete" class="oc-flex oc-flex-nowrap oc-flex-middle">
              <role-dropdown
                :resource="highlightedFile"
                :dom-selector="shareDomSelector"
                :existing-permissions="share.customPermissions"
                :existing-role="share.role"
                :allow-share-permission="hasResharing || isSpace"
                class="files-collaborators-collaborator-role"
                @optionChange="shareRoleChanged"
              />
            </div>
            <div v-else-if="share.role">
              <span
                v-oc-tooltip="$gettext(share.role.description(false))"
                class="oc-mr-xs"
                v-text="$gettext(share.role.label)"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="oc-flex flex-en oc-flex-middle oc-width-1-3" style="justify-content: end">
        <div v-if="sharedParentRoute" class="oc-resource-indicators oc-text-truncate">
          <router-link
            v-oc-tooltip="$gettext('Navigate to parent folder')"
            class="parent-folder oc-text-truncate"
            :to="sharedParentRoute"
          >
            <span class="text" v-text="$gettext('via')" />
            <oc-icon name="folder-2" size="small" fill-type="line" class="oc-px-xs" />
            <span class="text oc-text-truncate" v-text="sharedParentDir" />
          </router-link>
        </div>
        <span v-if="hasExpirationDate">
          <oc-icon
            v-oc-tooltip="expirationDate"
            class="files-collaborators-collaborator-expiration"
            data-testid="recipient-info-expiration-date"
            :aria-label="expirationDate"
            name="calendar"
            fill-type="line"
          />
          <span class="oc-invisible-sr" v-text="screenreaderShareExpiration" />
        </span>
        <edit-dropdown
          :id="`edit-drop-down-${editDropDownToggleId}`"
          class="files-collaborators-collaborator-edit"
          data-testid="collaborator-edit"
          :expiration-date="share.expires ? share.expires : null"
          :share-category="shareCategory"
          :can-edit-or-delete="canEditOrDelete"
          @expirationDateChanged="shareExpirationChanged"
          @removeShare="removeShare"
          @showAccessDetails="showAccessDetails"
          @notify="notify"
        />
        <oc-info-drop
          ref="accessDetailsDrop"
          class="share-access-details-drop"
          v-bind="isSpace ? accessDetailsPropsSpace : accessDetailsProps"
          mode="manual"
          :target="`#edit-drop-down-${editDropDownToggleId}`"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { mapGetters, mapActions, mapState } from 'vuex'
import { DateTime } from 'luxon'

import EditDropdown from './EditDropdown.vue'
import RoleDropdown from './RoleDropdown.vue'
import { SharePermissions, ShareTypes } from 'web-client/src/helpers/share'
import { useCapabilityFilesSharingResharing } from 'web-pkg/src/composables'
import { extractDomSelector } from 'web-client/src/helpers/resource'
import { defineComponent } from '@vue/composition-api'
import * as uuid from 'uuid'
import { formatDateFromDateTime, formatRelativeDateFromDateTime } from 'web-pkg/src/helpers'

export default defineComponent({
  name: 'ListItem',
  components: {
    EditDropdown,
    RoleDropdown
  },
  props: {
    share: {
      type: Object,
      required: true
    },
    modifiable: {
      type: Boolean,
      default: false
    },
    sharedParentRoute: {
      type: Object,
      default: null
    }
  },
  setup() {
    return {
      hasResharing: useCapabilityFilesSharingResharing()
    }
  },
  computed: {
    ...mapGetters('Files', ['highlightedFile']),
    ...mapState(['user']),

    shareType() {
      return ShareTypes.getByValue(this.share.shareType)
    },

    shareTypeIcon() {
      return this.shareType.icon
    },

    shareTypeKey() {
      return this.shareType.key
    },

    shareDomSelector() {
      if (!this.share.id) {
        return undefined
      }
      return extractDomSelector(this.share.id)
    },

    isGroup() {
      return this.shareType === ShareTypes.group
    },

    isUser() {
      return this.shareType === ShareTypes.user
    },

    isSpace() {
      return this.shareType === ShareTypes.space
    },

    shareTypeText() {
      return this.$gettext(this.shareType.label)
    },

    shareCategory() {
      return ShareTypes.isIndividual(this.shareType) ? 'user' : 'group'
    },

    shareDisplayName() {
      if (this.user.id === this.share.collaborator.name) {
        return this.$gettextInterpolate(this.$gettext('%{collaboratorName} (me)'), {
          collaboratorName: this.share.collaborator.displayName
        })
      }
      return this.share.collaborator.displayName
    },

    shareAdditionalInfo() {
      return this.share.collaborator.additionalInfo
    },

    shareDisplayNameTooltip() {
      return (
        this.shareDisplayName + (this.shareAdditionalInfo ? `(${this.shareAdditionalInfo})` : '')
      )
    },

    screenreaderShareDisplayName() {
      const context = {
        displayName: this.share.collaborator.displayName,
        ...(this.share.collaborator.additionalInfo && {
          additionalInfo: this.share.collaborator.additionalInfo
        })
      }
      let translated = this.$gettext('Share receiver name: %{ displayName }')
      if (this.shareAdditionalInfo) {
        translated = this.$gettext('Share receiver name: %{ displayName } (%{ additionalInfo })')
      }
      return this.$gettextInterpolate(translated, context)
    },

    screenreaderShareExpiration() {
      const translated = this.$gettext('Share expires %{ expiryDateRelative } (%{ expiryDate })')
      return this.$gettextInterpolate(translated, {
        expiryDateRelative: this.expirationDateRelative,
        expiryDate: this.expirationDate
      })
    },

    canEditOrDelete() {
      return this.modifiable
    },

    hasExpirationDate() {
      return this.share.expires
    },

    expirationDate() {
      return formatDateFromDateTime(
        DateTime.fromJSDate(this.share.expires).endOf('day'),
        this.$language.current
      )
    },

    expirationDateRelative() {
      return formatRelativeDateFromDateTime(
        DateTime.fromJSDate(this.share.expires).endOf('day'),
        this.$language.current
      )
    },

    sharedParentDir() {
      return this.sharedParentRoute?.params?.item.split('/').pop()
    },

    editDropDownToggleId() {
      return uuid.v4()
    },
    shareDate() {
      return formatDateFromDateTime(
        DateTime.fromSeconds(parseInt(this.share.stime)),
        this.$language.current
      )
    },
    shareOwnerDisplayName() {
      return this.share.owner.displayName
    },
    shareOwnerAdditionalInfo() {
      return this.share.owner.additionalInfo
    },
    accessDetailsPropsSpace() {
      const list = []

      list.push({ text: this.$gettext('Name'), headline: true }, { text: this.shareDisplayName })

      if (this.shareAdditionalInfo) {
        list.push(
          { text: this.$gettext('Additional info'), headline: true },
          { text: this.shareAdditionalInfo }
        )
      }

      list.push({ text: this.$gettext('Type'), headline: true }, { text: this.shareTypeText })

      return {
        title: this.$gettext('Access details'),
        list
      }
    },
    accessDetailsProps() {
      const list = []

      list.push({ text: this.$gettext('Name'), headline: true }, { text: this.shareDisplayName })

      if (this.shareAdditionalInfo) {
        list.push(
          { text: this.$gettext('Additional info'), headline: true },
          { text: this.shareAdditionalInfo }
        )
      }

      list.push({ text: this.$gettext('Type'), headline: true }, { text: this.shareTypeText })
      list.push(
        { text: this.$gettext('Access expires'), headline: true },
        { text: this.hasExpirationDate ? this.expirationDate : this.$gettext('no') }
      )
      list.push({ text: this.$gettext('Shared on'), headline: true }, { text: this.shareDate })
      list.push(
        { text: this.$gettext('Invited by'), headline: true },
        {
          text: this.shareOwnerAdditionalInfo
            ? `${this.shareOwnerDisplayName} (${this.shareOwnerAdditionalInfo})`
            : this.shareOwnerDisplayName
        }
      )

      return {
        title: this.$gettext('Access details'),
        list
      }
    }
  },
  methods: {
    ...mapActions(['showMessage']),
    ...mapActions('Files', ['changeShare']),
    ...mapActions('runtime/spaces', ['changeSpaceMember']),

    removeShare() {
      this.$emit('onDelete', this.share)
    },

    async notify() {
      const url = `/mailer`
      const accessToken = this.$store.getters['runtime/auth/accessToken']
      const headers = new Headers()
      headers.append('Authorization', 'Bearer ' + accessToken)
      headers.append('X-Requested-With', 'XMLHttpRequest')
      headers.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')

      const formData = new URLSearchParams()

      formData.append('id', this.share.id)
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData.toString()
      })
      if (!response.ok) {
        this.showMessage({
          title: this.$gettext('An error occurred'),
          desc: this.$gettext('Email notification could not be sent'),
          status: 'danger'
        })
      } else {
        const recipients = await response.json()
        if (recipients.recipients)
          this.showMessage({
            title: this.$gettext('Success'),
            desc: this.$gettext(`Email notification was sent to ${recipients.recipients[0]}`),
            status: 'success'
          })
      }
    },
    showAccessDetails() {
      this.$refs.accessDetailsDrop.$refs.drop.show()
    },

    shareRoleChanged({ role, permissions }) {
      const expirationDate = this.share.expires
      try {
        this.saveShareChanges({ role, permissions, expirationDate })
      } catch (e) {
        console.error(e)
        this.showMessage({
          title: this.$gettext('Failed to apply new permissions'),
          status: 'danger'
        })
      }
    },

    shareExpirationChanged({ expirationDate }) {
      const role = this.share.role
      const permissions = this.share.customPermissions
      try {
        this.saveShareChanges({ role, permissions, expirationDate })
      } catch (e) {
        console.error(e)
        this.showMessage({
          title: this.$gettext('Failed to apply expiration date'),
          status: 'danger'
        })
      }
    },

    saveShareChanges({ role, permissions, expirationDate }) {
      const bitmask = role.hasCustomPermissions
        ? SharePermissions.permissionsToBitmask(permissions)
        : SharePermissions.permissionsToBitmask(role.permissions(this.hasResharing || this.isSpace))
      const changeMethod = this.isSpace ? this.changeSpaceMember : this.changeShare
      changeMethod({
        client: this.$client,
        share: this.share,
        permissions: bitmask,
        expirationDate: expirationDate || '',
        role
      })
    }
  }
})
</script>

<style lang="scss" scoped>
.sharee-avatar {
  min-width: 36px;
}

.share-access-details-drop {
  dl {
    display: grid;
    grid-template-columns: max-content auto;
  }

  dt {
    grid-column-start: 1;
  }

  dd {
    grid-column-start: 2;
    margin-left: var(--oc-space-medium);
  }
}
</style>

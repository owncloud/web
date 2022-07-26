<template>
  <div
    :data-testid="`collaborator-${isUser || isSpace ? 'user' : 'group'}-item-${
      share.collaborator.name
    }`"
    class="files-collaborators-collaborator oc-flex oc-flex-middle oc-py-xs oc-flex-between"
  >
    <div class="oc-width-1-1 oc-flex oc-flex-middle" style="gap: 10px">
      <avatar-image
        v-if="isUser || isSpace"
        :userid="share.collaborator.name"
        :user-name="share.collaborator.displayName"
        :width="48"
        class="files-collaborators-collaborator-indicator"
      />
      <oc-avatar-item
        v-else
        :width="48"
        icon-size="medium"
        :icon="shareTypeIcon"
        :name="shareTypeKey"
        class="files-collaborators-collaborator-indicator"
      />
      <div class="oc-text-truncate oc-width-1-1">
        <div class="oc-flex oc-flex-middle">
          <span v-oc-tooltip="shareDisplayNameTooltip" class="oc-text-truncate oc-m-rm">
            <span
              aria-hidden="true"
              class="files-collaborators-collaborator-name"
              v-text="shareDisplayName"
            />
          </span>
          <span class="oc-invisible-sr" v-text="screenreaderShareDisplayName" />
          <oc-drop
            ref="accessDetails"
            class="share-access-details-drop"
            mode="manual"
            :target="`#edit-drop-down-${editDropDownToggleId}`"
          >
            <h5 v-translate class="oc-text-bold oc-m-rm">Access details</h5>
            <dl class="oc-mt-s">
              <dt v-if="shareAdditionalInfo" v-translate class="oc-text-muted oc-mb-s">Addition</dt>
              <dd
                v-if="shareAdditionalInfo"
                class="files-collaborators-collaborator-additional-info"
                v-text="shareAdditionalInfo"
              />
              <dt v-translate class="oc-text-muted">Type</dt>
              <dd class="files-collaborators-collaborator-share-type" v-text="shareTypeText" />
            </dl>
          </oc-drop>
        </div>
        <div class="oc-m-rm oc-flex oc-flex-middle oc-flex-between">
          <div>
            <div v-if="canEditOrDelete" class="oc-flex oc-flex-nowrap oc-flex-right oc-flex-middle">
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
              <span class="oc-mr-xs" v-text="share.role.label" />
            </div>
          </div>
          <div class="oc-flex oc-flex-between oc-flex-middle oc-pl-s">
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
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { mapGetters, mapActions, mapState } from 'vuex'
import Mixins from '../../../../mixins'
import { DateTime } from 'luxon'

import EditDropdown from './EditDropdown.vue'
import RoleDropdown from './RoleDropdown.vue'
import { SharePermissions, ShareTypes } from '../../../../helpers/share'
import { useCapabilityFilesSharingResharing } from 'web-pkg/src/composables'
import { extractDomSelector } from '../../../../helpers/resource'
import { defineComponent } from '@vue/composition-api'
import { useGraphClient } from 'web-client/src/composables'
import * as uuid from 'uuid'

export default defineComponent({
  name: 'ListItem',
  components: {
    EditDropdown,
    RoleDropdown
  },
  mixins: [Mixins],
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
      ...useGraphClient(),
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

    shareExpirationText() {
      const translated = this.$gettext('Expires %{ expiryDateRelative }')
      return this.$gettextInterpolate(translated, {
        expiryDateRelative: this.expirationDateRelative
      })
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
      return DateTime.fromJSDate(this.share.expires)
        .endOf('day')
        .setLocale(this.$language.current)
        .toLocaleString(DateTime.DATETIME_FULL)
    },

    expirationDateRelative() {
      return DateTime.fromJSDate(this.share.expires)
        .endOf('day')
        .setLocale(this.$language.current)
        .toRelative()
    },

    sharedParentDir() {
      return this.sharedParentRoute?.params?.item.split('/').pop()
    },

    shareDetailsHelperContent() {
      return {
        text: this.$gettext('Invite persons or groups to access this file or folder.')
      }
    },
    editDropDownToggleId() {
      return uuid.v4()
    }
  },
  methods: {
    ...mapActions(['showMessage']),
    ...mapActions('Files', ['changeShare']),

    removeShare() {
      this.$emit('onDelete', this.share)
    },

    showAccessDetails() {
      console.log('SHOW EVENT EMITTED')
      this.$refs.accessDetails.show()
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
        : SharePermissions.permissionsToBitmask(
            role.permissions(this.hasResharing || this.shareType === ShareTypes.space)
          )
      this.changeShare({
        client: this.$client,
        graphClient: this.graphClient,
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
  min-width: 48px;
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

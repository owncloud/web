<template>
  <oc-table-simple top class="files-collaborators-collaborator">
    <oc-tr class="files-collaborators-collaborator-table-row-info">
      <oc-td width="shrink">
        <div key="collaborator-avatar-loaded">
          <avatar-image
            v-if="isUser"
            class="oc-mr-s files-collaborators-collaborator-indicator"
            :width="48"
            :userid="collaborator.collaborator.name"
            :user-name="collaborator.collaborator.displayName"
            :aria-label="$gettext('User')"
          />
          <div v-else key="collaborator-avatar-placeholder">
            <oc-icon
              v-if="collaborator.shareType === shareTypes.group"
              key="avatar-group"
              class="oc-mr-s files-collaborators-collaborator-indicator"
              name="group"
              size="xlarge"
              :accessible-label="$gettext('Group')"
            />
            <oc-icon
              v-else
              key="avatar-generic-person"
              class="oc-mr-s files-collaborators-collaborator-indicator"
              name="person"
              size="xlarge"
              :accessible-label="$gettext('Remote user')"
            />
          </div>
        </div>
      </oc-td>
      <oc-td>
        <div class="uk-flex uk-flex-column uk-flex-center" :class="collaboratorListItemClass">
          <div class="oc-text-initial oc-mb-xs">
            <span>
              <span class="files-collaborators-collaborator-name oc-text-bold">
                {{ collaborator.collaborator.displayName }}
              </span>
              <translate
                v-if="isCurrentUser"
                translate-comment="Indicator for current user in list of people"
                class="oc-text-muted files-collaborators-collaborator-additional-info"
              >
                (me)
              </translate>
            </span>
            <span
              v-if="collaborator.collaborator.additionalInfo"
              class="oc-text-muted files-collaborators-collaborator-additional-info"
              v-text="collaborator.collaborator.additionalInfo"
            />
          </div>
          <oc-grid gutter="small">
            <div v-if="!isCurrentUser">
              <oc-tag class="files-collaborators-collaborator-share-type">
                <oc-icon :name="collaboratorTypeTagIcon" />
                {{ collaboratorType(collaborator.shareType) }}
              </oc-tag>
            </div>
            <div v-if="$_reshareInformation">
              <oc-tag
                :id="$_resharerToggleId"
                class="files-collaborators-collaborator-reshare-information"
                type="button"
                :uk-tooltip="$gettext('Show resharer details')"
              >
                <oc-icon name="repeat" />
                <translate :translate-params="{ resharer: $_reshareInformation }">
                  Shared by %{resharer}
                </translate>
              </oc-tag>
              <oc-drop
                ref="menu"
                :drop-id="$_resharerToggleId + '-drop'"
                :toggle="'#' + $_resharerToggleId"
                mode="click"
                :options="{ pos: 'bottom-left', delayHide: 0 }"
                class="oc-mt-s"
                close-on-click
              >
                <translate tag="h4">Shared by</translate>
                <ul class="uk-list uk-list-divider uk-overflow-hidden oc-m-rm">
                  <li v-for="resharer in collaborator.resharers" :key="resharer.name">
                    <div class="uk-flex uk-flex-middle uk-flex-left">
                      <avatar-image
                        class="oc-mr-s"
                        :width="48"
                        :userid="resharer.name"
                        :user-name="resharer.displayName"
                      />
                      <div>
                        <span class="files-collaborators-resharer-name oc-text-bold">{{
                          resharer.displayName
                        }}</span>
                        <span
                          v-if="resharer.additionalInfo"
                          class="oc-text-muted files-collaborators-resharer-additional-info"
                          >({{ resharer.additionalInfo }})</span
                        >
                      </div>
                    </div>
                  </li>
                </ul>
              </oc-drop>
            </div>
            <div>
              <oc-tag class="files-collaborators-collaborator-role">
                <oc-icon :name="roleTagIcon" />
                {{ originalRole.label }}
              </oc-tag>
            </div>
            <div v-if="collaborator.expires">
              <oc-tag class="files-collaborators-collaborator-expires">
                <oc-icon name="text-calendar" />
                <translate :translate-params="{ expires: formDateFromNow(expirationDate) }">
                  Expires %{expires}
                </translate>
              </oc-tag>
            </div>
            <div v-if="isIndirectShare">
              <oc-tag
                type="router-link"
                class="files-collaborators-collaborator-follow-via"
                :to="viaRouterParams"
                :uk-tooltip="viaTooltip"
              >
                <oc-icon name="exit_to_app" />
                <span
                  class="uk-text-truncate files-collaborators-collaborator-via-label"
                  v-text="viaLabel"
                />
              </oc-tag>
            </div>
          </oc-grid>
        </div>
      </oc-td>
      <oc-td width="shrink" align-v="top">
        <div class="uk-flex uk-flex-nowrap uk-flex-middle">
          <oc-button
            v-if="$_editButtonVisible"
            :aria-label="$gettext('Edit share')"
            :uk-tooltip="$gettext('Edit share')"
            appearance="raw"
            class="files-collaborators-collaborator-edit"
            @click="$emit('onEdit', collaborator)"
          >
            <oc-icon name="edit" />
          </oc-button>
          <div>
            <oc-button
              v-if="$_deleteButtonVisible"
              :aria-label="$gettext('Delete share')"
              :uk-tooltip="$gettext('Delete share')"
              appearance="raw"
              class="files-collaborators-collaborator-delete"
              @click="$_removeShare"
            >
              <oc-icon name="delete" />
            </oc-button>
            <oc-spinner
              v-else-if="$_loadingSpinnerVisible"
              :aria-label="$gettext('Removing person')"
            />
            <oc-icon v-else name="lock" class="uk-invisible" />
          </div>
        </div>
      </oc-td>
    </oc-tr>
  </oc-table-simple>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import { shareTypes } from '../../helpers/shareTypes'
import { basename } from 'path'
import CollaboratorsMixins from '../../mixins/collaborators'
import Mixins from '../../mixins'

export default {
  name: 'Collaborator',
  mixins: [Mixins, CollaboratorsMixins],
  props: {
    collaborator: {
      type: Object,
      required: true
    },
    modifiable: {
      type: Boolean,
      default: false
    },
    firstColumn: {
      type: Boolean,
      default: true
    }
  },
  data: function() {
    return {
      removalInProgress: false
    }
  },
  computed: {
    ...mapGetters(['user']),

    shareTypes() {
      return shareTypes
    },

    $_resharerToggleId() {
      return 'collaborator-' + this.collaborator.collaborator.name + '-resharer-details-toggle'
    },

    $_loadingSpinnerVisible() {
      return this.modifiable && this.removalInProgress
    },
    $_deleteButtonVisible() {
      return this.modifiable && !this.removalInProgress
    },
    $_editButtonVisible() {
      return this.modifiable && !this.removalInProgress
    },

    isIndirectShare() {
      // it is assumed that the "incoming" attribute only exists
      // on shares coming from this.collaborator.sTree which are all indirect
      // and not related to the current folder
      return this.collaborator.incoming || this.collaborator.outgoing
    },

    $_reshareInformation() {
      if (!this.collaborator.resharers) {
        return null
      }
      return this.collaborator.resharers.map(share => share.displayName).join(', ')
    },

    viaLabel() {
      if (!this.isIndirectShare) {
        return null
      }
      const translated = this.$gettext('Via %{folderName}')
      return this.$gettextInterpolate(
        translated,
        { folderName: basename(this.collaborator.path) },
        true
      )
    },

    viaRouterParams() {
      return {
        name: 'files-personal',
        params: {
          item: this.collaborator.path || '/'
        }
      }
    },

    viaTooltip() {
      return this.$gettext('Navigate to the parent')
    },

    originalRole() {
      if (this.collaborator.role.name === 'advancedRole') {
        return this.advancedRole
      }

      const role = this.displayRoles[this.collaborator.role.name]
      if (role) {
        return role
      }

      return {
        label: this.$gettext('Unknown Role')
      }
    },

    isUser() {
      return this.collaborator.shareType === this.shareTypes.user
    },

    isRemoteUser() {
      return this.collaborator.shareType === this.shareTypes.remote
    },

    isGroup() {
      return this.collaborator.shareType === this.shareTypes.group
    },

    collaboratorListItemClass() {
      const isUser = this.isUser || this.isRemoteUser

      return (
        'files-collaborators-collaborator-info-' +
        (isUser ? (this.isRemoteUser ? 'remote' : 'user') : 'group')
      )
    },

    expirationDate() {
      return moment(this.collaborator.expires).endOf('day')
    },

    isCurrentUser() {
      return !this.isGroup && this.collaborator.collaborator.name === this.user.id
    },

    collaboratorTypeTagIcon() {
      if (this.isGroup) {
        return 'group'
      }

      return 'person'
    },

    roleTagIcon() {
      switch (this.collaborator.role.name) {
        case 'viewer':
          return 'remove_red_eye'

        case 'editor':
          return 'edit'

        case 'advancedRole':
          return 'checklist'

        default:
          return 'key'
      }
    }
  },
  methods: {
    $_removeShare() {
      this.removalInProgress = true
      this.$emit('onDelete', this.collaborator)
    }
  }
}
</script>

<style scoped="scoped">
/* FIXME: Move to ODS somehow */
.files-collaborators-collaborator-table-row-top > td {
  padding: 0 10px 3px 0;
}
.files-collaborators-collaborator-table-row-info > td {
  padding: 0 10px 0 0;
}
.files-collaborators-collaborator-table-row-bottom > td {
  padding: 3px 10px 0 0;
}
.files-collaborators-collaborator-via-label {
  max-width: 75%;
}
</style>

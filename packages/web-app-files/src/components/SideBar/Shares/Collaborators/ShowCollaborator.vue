<template>
  <oc-table-simple top class="files-collaborators-collaborator" role="presentation">
    <oc-tr class="files-collaborators-collaborator-table-row-info">
      <oc-td width="shrink" class="oc-py-rm oc-pr-s">
        <div key="collaborator-avatar-loaded">
          <oc-avatar
            v-if="shareTypeName === 'user'"
            :src="''"
            :user-name="collaborator.collaborator.displayName"
            :width="48"
          />
          <oc-avatar-item
            v-else
            :width="48"
            icon-size="medium"
            :icon="shareTypeName"
            :name="shareTypeName"
          />
        </div>
      </oc-td>
      <oc-td class="oc-py-rm oc-pr-s">
        <div class="uk-flex uk-flex-column uk-flex-center" :class="collaboratorListItemClass">
          <div class="oc-text-initial oc-mb-xs">
            <p
              class="files-collaborators-collaborator-name oc-text-bold oc-mb-rm"
              v-text="shareDisplayName"
            />
          </div>
          <span :id="`collaborator-list-label-${shareId}`" v-translate class="oc-invisible-sr"
            >Tags</span
          >
          <ul
            class="collaborator-list oc-my-rm oc-pl-rm"
            :aria-labelledby="`collaborator-list-label-${shareId}`"
          >
            <li>{{ shareTypeText }}</li>
            <li v-if="expirationDate">{{ expirationText }} {{ expirationDate }}</li>
            <li v-if="$_reshareInformation" class="oc-py-rm">
              <oc-drop
                ref="menu"
                :drop-id="$_resharerToggleId + '-drop'"
                :toggle="'#' + $_resharerToggleId"
                mode="click"
                :options="{ pos: 'bottom-left', delayHide: 0 }"
                class="oc-mt-s"
                close-on-click
              >
                <h4 :id="`resharer-info-${shareId}`" v-translate>Shared by</h4>
                <ul
                  class="uk-list uk-list-divider uk-overflow-hidden oc-m-rm"
                  :aria-labelledby="`resharer-info-${shareId}`"
                >
                  <li
                    v-for="resharer in collaborator.resharers"
                    :key="resharer.name"
                    class="oc-py-rm"
                  >
                    <div class="uk-flex uk-flex-middle uk-flex-left">
                      <avatar-image
                        class="oc-mr-s"
                        :width="48"
                        :userid="resharer.name"
                        :user-name="resharer.displayName"
                      />
                      <div>
                        <p
                          class="files-collaborators-resharer-name oc-text-bold oc-my-rm"
                          v-text="resharer.displayName"
                        />
                        <p
                          v-if="resharer.additionalInfo"
                          class="
                            oc-text-muted
                            files-collaborators-resharer-additional-info
                            oc-my-rm
                          "
                          v-text="resharer.additionalInfo"
                        />
                      </div>
                    </div>
                  </li>
                </ul>
              </oc-drop>
            </li>
            <li class="oc-py-rm"></li>
          </ul>
        </div>
      </oc-td>
      <oc-td width="shrink" align-v="top" class="oc-py-rm oc-pr-s">
        <div class="uk-flex uk-flex-nowrap uk-flex-middle">
          <!-- im here -->
          <collaborators-edit-options
            :minimal="true"
            existing-collaborator-type="user"
            class="oc-mb"
            @optionChange="collaboratorOptionChanged"
          />
        </div>
      </oc-td>
    </oc-tr>
  </oc-table-simple>
</template>

<script>
import { mapGetters } from 'vuex'
import { shareTypes } from '../../../../helpers/shareTypes'
import { basename } from 'path'
import CollaboratorsMixins from '../../../../mixins/collaborators'
import Mixins from '../../../../mixins'
import { DateTime } from 'luxon'
import CollaboratorsEditOptions from './CollaboratorsEditOptions.vue'

export default {
  name: 'Collaborator',
  components: {
    CollaboratorsEditOptions
  },
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
  data: function () {
    return {
      removalInProgress: false
    }
  },
  computed: {
    ...mapGetters(['user']),

    shareTypeText() {
      switch (this.shareType) {
        case shareTypes.user:
          return this.$gettext('User')
        case shareTypes.group:
          return this.$gettext('Group')
        case shareTypes.link:
          return this.$gettext('Link')
        case shareTypes.guest:
          return this.$gettext('Guest')
        case shareTypes.remote:
          return this.$gettext('Federated')
        default:
          return this.$gettext('User')
      }
    },

    shareTypeName() {
      return Object.keys(shareTypes)[this.shareType]
    },

    shareDisplayName() {
      const displayName = this.collaborator.collaborator.displayName
      const additionalInfo = this.collaborator.collaborator.additionalInfo
      if (additionalInfo === null) return displayName
      return `${displayName} (${additionalInfo})`
    },

    shareTypes() {
      return shareTypes
    },

    shareId() {
      console.log(this.collaborator)
      return this.collaborator.id
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

    editShareHint() {
      const translated = this.$gettext('Edit share with %{ currentCollaborator }')
      return this.$gettextInterpolate(
        translated,
        { currentCollaborator: this.collaborator.collaborator.displayName },
        true
      )
    },

    deleteShareHint() {
      const translated = this.$gettext('Delete share with %{ currentCollaborator }')
      return this.$gettextInterpolate(
        translated,
        { currentCollaborator: this.collaborator.collaborator.displayName },
        true
      )
    },

    isIndirectShare() {
      // it is assumed that the "incoming" attribute only exists
      // on shares coming from this.collaborator.sTree which are all indirect
      // and not related to the current folder
      return this.collaborator.incoming || this.collaborator.outgoing
    },

    $_reshareInformation() {
      try {
        this.collaborator.resharers.forEach(function (share) {
          if (typeof share.displayName !== 'string' || !share.displayName) {
            throw Error('displayName of resharer is not a string')
          }
        })
        return this.collaborator.resharers.map((share) => share.displayName).join(', ')
      } catch (e) {
        return null
      }
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
      const role = this.displayRoles.find((r) => r.name === this.collaborator.role.name)

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

    shareType() {
      return this.collaborator.shareType ? this.collaborator.shareType : 0
    },

    isRemoteUser() {
      return this.collaborator.shareType === this.shareTypes.remote
    },

    isGroup() {
      return this.collaborator.shareType === this.shareTypes.group
    },

    expirationText() {
      return this.$gettext('Expires')
    },

    expirationDate() {
      return DateTime.fromJSDate(this.collaborator.expires)
        .endOf('day')
        .setLocale(this.$language.current)
        .toRelative()
    },

    collaboratorListItemClass() {
      const isUser = this.isUser || this.isRemoteUser

      return (
        'files-collaborators-collaborator-info-' +
        (isUser ? (this.isRemoteUser ? 'remote' : 'user') : 'group')
      )
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
    },

    collaboratorOptionChanged(data) {
      console.log(data)
    }
  }
}
</script>

<style lang="scss" scoped="scoped">
.collaborators-edit {
  width: 200px;
}

.collaborator-list {
  list-style-type: none;

  li {
    float: left;
    margin-right: 5px;
  }
}

/* FIXME: Move to ODS somehow */
.files-collaborators-collaborator-via-label {
  max-width: 75%;
}
</style>

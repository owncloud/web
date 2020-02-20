<template>
  <oc-table middle class="files-collaborators-collaborator">
    <oc-table-row v-if="$_reshareInformation" class="files-collaborators-collaborator-table-row-top">
      <oc-table-cell shrink :colspan="firstColumn ? 2 : 1"></oc-table-cell>
      <oc-table-cell colspan="2">
        <div class="uk-text-meta uk-flex uk-flex-middle">
          <oc-icon name="repeat" class="uk-preserve-width" />
          <span class="uk-padding-remove uk-margin-xsmall-left uk-text-truncate files-collaborators-collaborator-reshare-information">{{ $_reshareInformation }}</span>
        </div>
      </oc-table-cell>
    </oc-table-row>
    <oc-table-row class="files-collaborators-collaborator-table-row-info">
      <oc-table-cell shrink v-if="firstColumn">
        <oc-button v-if="$_deleteButtonVisible" :ariaLabel="$gettext('Delete share')" @click="$_removeShare" variation="raw" class="files-collaborators-collaborator-delete">
          <oc-icon name="close" />
        </oc-button>
        <oc-spinner v-else-if="$_loadingSpinnerVisible" :aria-label="$gettext('Removing collaborator…')" size="small" />
        <oc-icon v-else name="lock" class="uk-invisible"></oc-icon>
      </oc-table-cell>
      <oc-table-cell shrink>
        <div key="collaborator-avatar-loaded">
          <avatar-image v-if="$_shareType === shareTypes.user" class="uk-margin-small-right" :width="48" :userid="collaborator.name" :userName="collaborator.displayName" />
          <div v-else key="collaborator-avatar-placeholder">
            <oc-icon v-if="$_shareType === shareTypes.group" class="uk-margin-small-right" name="group" size="large" key="avatar-group" />
            <oc-icon v-else class="uk-margin-small-right" name="person" size="large" key="avatar-generic-person" />
          </div>
        </div>
      </oc-table-cell>
      <oc-table-cell>
        <div class="uk-flex uk-flex-column uk-flex-center">
          <div class="oc-text">
            <span class="files-collaborators-collaborator-name uk-text-bold">{{ collaborator.displayName }}</span>
            <span v-if="$_shareType === shareTypes.user && collaborator.info.share_with_additional_info.length > 0" class="uk-text-meta files-collaborators-collaborator-additional-info">({{ collaborator.info.share_with_additional_info }})</span>
            <translate
              v-if="collaborator.name === user.id"
              translate-comment="Indicator for current user in collaborators list"
              class="uk-text-meta files-collaborators-collaborator-additional-info"
            >
              (me)
            </translate>
          </div>
          <span class="oc-text"><span class="files-collaborators-collaborator-role">{{ originalRole.label }}</span><template v-if="collaborator.expires"> | <translate :translate-params="{expires: formDateFromNow(collaborator.expires)}">Expires: %{expires}</translate></template></span>
          <span class="uk-text-meta files-collaborators-collaborator-share-type" v-text="$_ocCollaborators_collaboratorType(collaborator.info.share_type)" />
        </div>
      </oc-table-cell>
      <oc-table-cell shrink>
        <oc-button v-if="$_editButtonVisible" :aria-label="$gettext('Edit share')" @click="$emit('onEdit', collaborator)" variation="raw" class="files-collaborators-collaborator-edit">
          <oc-icon name="edit" />
        </oc-button>
      </oc-table-cell>
    </oc-table-row>
    <oc-table-row v-if="$_viaLabel" class="files-collaborators-collaborator-table-row-bottom">
      <oc-table-cell shrink :colspan="firstColumn ? 2 : 1"></oc-table-cell>
      <oc-table-cell colspan="2">
        <div class="uk-text-meta">
          <router-link :to="$_viaRouterParams" :aria-label="$gettext('Navigate to parent')"
                       class="files-collaborators-collaborator-follow-via uk-flex uk-flex-middle">
            <oc-icon name="exit_to_app" size="small" class="uk-preserve-width" />
            <span class="oc-file-name uk-padding-remove uk-margin-xsmall-left uk-text-truncate files-collaborators-collaborator-via-label">{{ $_viaLabel }}</span>
          </router-link>
        </div>
      </oc-table-cell>
    </oc-table-row>
  </oc-table>
</template>

<script>
import { mapGetters } from 'vuex'
import { shareTypes } from '../../helpers/shareTypes'
import { basename, dirname } from 'path'
import Mixins from '../../mixins/collaborators'

export default {
  name: 'Collaborator',
  mixins: [
    Mixins
  ],
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
      shareTypes,
      removalInProgress: false
    }
  },
  computed: {
    ...mapGetters(['user']),

    $_loadingSpinnerVisible () {
      return this.modifiable && this.removalInProgress
    },
    $_deleteButtonVisible () {
      return this.modifiable && !this.removalInProgress
    },
    $_editButtonVisible () {
      return this.modifiable && !this.removalInProgress
    },

    $_isIndirectShare () {
      // it is assumed that the "incoming" attribute only exists
      // on shares coming from this.sharesTree which are all indirect
      // and not related to the current folder
      return this.collaborator.incoming || this.collaborator.outgoing
    },

    $_reshareInformation () {
      if (this.collaborator.role.name === 'owner' || this.collaborator.role.name === 'resharer' || this.user.id === this.collaborator.info.uid_owner) {
        return null
      }

      return this.collaborator.info.displayname_owner
    },

    $_shareType () {
      return parseInt(this.collaborator.info.share_type, 10)
    },

    $_viaLabel () {
      if (!this.$_isIndirectShare) {
        return null
      }
      const translated = this.$gettext('Via %{folderName}')
      return this.$gettextInterpolate(translated, { folderName: basename(this.collaborator.info.path) }, true)
    },

    $_viaRouterParams () {
      const viaPath = this.collaborator.info.path
      return {
        name: 'files-list',
        params: {
          item: dirname(viaPath) || '/'
        },
        query: {
          scrollTo: basename(viaPath)
        }
      }
    },

    originalRole () {
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
    }
  },
  methods: {
    $_removeShare () {
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
<style>
  /* TODO: Move to ODS  */
  .oc-text {
    font-size: 1rem;
  }
</style>

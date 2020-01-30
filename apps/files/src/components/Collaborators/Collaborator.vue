<template>
  <oc-table middle class="files-collaborators-collaborator">
    <oc-table-row v-if="$_reshareInformation || $_viaLabel" class="files-collaborators-collaborator-table-row-extra">
      <oc-table-cell shrink colspan="2"></oc-table-cell>
      <oc-table-cell colspan="2">
        <div v-if="$_reshareInformation" class="uk-text-meta uk-flex uk-flex-middle">
          <oc-icon name="repeat" class="uk-preserve-width" />
          <span>{{ $_reshareInformation }}</span>
        </div>
        <div v-if="$_viaLabel" class="uk-text-meta">
          <router-link :to="$_viaRouterParams" :aria-label="$gettext('Navigate to parent')"
                       class="files-collaborators-collaborator-follow-via uk-flex uk-flex-middle">
            <oc-icon name="exit_to_app" size="small" class="uk-preserve-width" />
            <span class="oc-file-name uk-padding-remove uk-margin-xsmall-left uk-text-truncate files-collaborators-collaborator-via-label">{{ $_viaLabel }}</span>
          </router-link>
        </div>
      </oc-table-cell>
    </oc-table-row>
    <oc-table-row class="files-collaborators-collaborator-table-row-info">
      <oc-table-cell shrink>
        <oc-button v-if="modifiable" :ariaLabel="$gettext('Delete share')" @click="$emit('onDelete', collaborator)" variation="raw" class="files-collaborators-collaborator-delete">
          <oc-icon name="close" />
        </oc-button>
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
            <span v-if="$_shareType === shareTypes.user && collaborator.info.share_with_additional_info.length > 0" class="uk-text-meta">({{ collaborator.info.share_with_additional_info }})</span>
          </div>
          <span class="oc-text"><span class="files-collaborators-collaborator-role">{{ originalRole.label }}</span><template v-if="collaborator.expires"> | <translate :translate-params="{expires: formDateFromNow(collaborator.expires)}">Expires: %{expires}</translate></template></span>
          <span class="uk-text-meta files-collaborators-collaborator-share-type" v-text="$_ocCollaborators_collaboratorType(collaborator.info.share_type)" />
        </div>
      </oc-table-cell>
      <oc-table-cell shrink>
        <oc-button v-if="modifiable" :aria-label="$gettext('Edit share')" @click="$emit('onEdit', collaborator)" variation="raw" class="files-collaborators-collaborator-edit">
          <oc-icon name="edit" />
        </oc-button>
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
  props: {
    collaborator: {
      type: Object,
      required: true
    },
    modifiable: {
      type: Boolean,
      default: false
    }
  },
  mixins: [
    Mixins
  ],
  data: function () {
    return {
      shareTypes
    }
  },
  computed: {
    ...mapGetters(['user']),

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
      return this.$gettextInterpolate(translated, { folderName: basename(this.collaborator.info.path) }, false)
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
  }
}
</script>

<style scoped="scoped">
  /* FIXME: Move to ODS somehow */
  .files-collaborators-collaborator-table-row-extra > td {
    padding: 0 10px 5px 0;
  }
  .files-collaborators-collaborator-table-row-info > td {
    padding: 0 10px 0 0;
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

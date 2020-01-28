<template>
  <div>
    <div v-if="$_reshareInformation" class="uk-text-meta uk-flex uk-flex-middle uk-margin-small-bottom"><oc-icon name="repeat" class="uk-margin-small-right" /> {{ $_reshareInformation }}</div>
    <div class="files-collaborators-collaborator-information uk-flex uk-flex-wrap uk-flex-middle">
      <div key="collaborator-avatar-loaded">
        <avatar-image v-if="$_shareType === shareTypes.user" class="uk-margin-small-right" :width="50" :userid="collaborator.name" :userName="collaborator.displayName" />
        <div v-else key="collaborator-avatar-placeholder">
          <oc-icon v-if="$_shareType === shareTypes.group" class="uk-margin-small-right" name="group" size="large" key="avatar-group" />
          <oc-icon v-else class="uk-margin-small-right" name="person" size="large" key="avatar-generic-person" />
        </div>
      </div>
      <div class="uk-flex uk-flex-column uk-flex-center files-collaborators-collaborator-information-text">
        <div class="oc-text">
          <span class="files-collaborators-collaborator-name uk-text-bold">{{ collaborator.displayName }}</span>
          <span v-if="parseInt(collaborator.info.share_type, 10) === 0 && collaborator.info.share_with_additional_info.length > 0" class="uk-text-meta">
            ({{ collaborator.info.share_with_additional_info }})
          </span>
        </div>
        <span class="oc-text">{{ originalRole.label }}<template v-if="collaborator.expires"> | <translate :translate-params="{expires: formDateFromNow(collaborator.expires)}">Expires: %{expires}</translate></template></span>
        <span class="uk-text-meta" v-text="$_ocCollaborators_collaboratorType(collaborator.info.share_type)" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { shareTypes } from '../../helpers/shareTypes'
import Mixins from '../../mixins/collaborators'

export default {
  name: 'Collaborator',
  props: ['collaborator'],
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

    $_reshareInformation () {
      if (this.collaborator.role.name === 'owner' || this.collaborator.role.name === 'resharer' || this.user.id === this.collaborator.info.uid_owner) {
        return null
      }

      return this.collaborator.info.displayname_owner
    },

    $_shareType () {
      return parseInt(this.collaborator.info.share_type, 10)
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

<style>
  /* TODO: Move to ODS  */
  .oc-text {
    font-size: 1rem;
  }
</style>

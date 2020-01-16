<template>
  <div>
    <div v-if="$_reshareInformation" class="uk-text-meta uk-flex uk-flex-middle uk-margin-small-bottom"><oc-icon name="repeat" class="uk-margin-small-right" /> {{ $_reshareInformation }}</div>
    <div class="files-collaborators-collaborator-information uk-flex uk-flex-wrap uk-flex-middle">
      <oc-spinner v-if="loading" key="collaborator-avatar-spinner" uk-spinner="ratio:1.6" class="uk-margin-small-right" :aria-label="$gettext('Loading')"/>
      <div v-else key="collaborator-avatar-loaded">
        <oc-avatar v-if="collaborator.info.share_type === '0'" :src="avatar" class="uk-margin-small-right" :width="50" :userName="collaborator.displayName" />
        <div v-else key="collaborator-avatar-placeholder">
          <oc-icon v-if="collaborator.info.share_type === '1'" class="uk-margin-small-right" name="group" size="large" />
          <oc-icon v-else class="uk-margin-small-right" name="person" size="large" />
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
import Mixins from '../../mixins/collaborators'

export default {
  name: 'Collaborator',
  props: ['collaborator'],
  mixins: [
    Mixins
  ],
  data () {
    return {
      avatar: '',
      loading: false
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
  mounted () {
    this.$_ocCollaborators_loadAvatar(this.collaborator)
  }
}
</script>

<style>
  /* TODO: Move to ODS  */
  .oc-text {
    font-size: 1rem;
  }
</style>

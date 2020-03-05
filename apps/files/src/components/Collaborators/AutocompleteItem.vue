<template>
  <div
    class="uk-flex uk-flex-middle"
    :class="collaboratorClass"
  >
    <avatar-image v-if="isUser" class="uk-margin-small-right" :width="48" :userid="item.value.shareWith" :userName="item.label" />
    <template v-else>
      <oc-icon v-if="item.value.shareType === shareTypes.group" class="uk-margin-small-right" name="group" size="large" key="avatar-group" />
      <oc-icon v-else class="uk-margin-small-right" name="person" size="large" key="avatar-generic-person" />
    </template>
    <div class="files-collaborators-autocomplete-user-text">
      <div
        class="uk-text-bold files-collaborators-autocomplete-username"
        v-text="item.label"
      />
      <div v-if="item.value.shareWithAdditionalInfo" v-text="item.value.shareWithAdditionalInfo" />
    </div>
  </div>
</template>

<script>
import Mixins from '../../mixins/collaborators'
import { shareTypes } from '../../helpers/shareTypes'

export default {
  name: 'AutocompleteItem',

  mixins: [Mixins],

  props: ['item'],

  data () {
    return {
      shareTypes,
      loading: false
    }
  },

  computed: {
    isUser () {
      return this.item.value.shareType === shareTypes.user
    },

    isRemoteUser () {
      return this.item.value.shareType === shareTypes.remote
    },

    collaboratorClass () {
      const isUser = this.isUser || this.isRemoteUser

      return 'files-collaborators-search-' + (
        isUser ? (this.isRemoteUser ? 'remote' : 'user') : 'group'
      )
    }
  }
}
</script>

<template>
  <div class="uk-flex uk-flex-middle">
    <avatar-image v-if="item.value.shareType === shareTypes.user" class="uk-margin-small-right" :width="50" :userid="item.value.shareWith" :userName="item.label" />
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
      <div class="uk-text-meta" v-text="$_ocCollaborators_collaboratorType(item.value.shareType)" />
    </div>
  </div>
</template>

<script>
import Mixins from '../../mixins/collaborators'
import { shareTypes } from '../../helpers/shareTypes'

export default {
  name: 'AutocompleteItem',
  props: ['item'],
  mixins: [Mixins],
  data () {
    return {
      shareTypes,
      loading: false
    }
  }
}
</script>

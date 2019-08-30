<template>
  <div class="uk-flex uk-flex-middle">
    <oc-spinner v-if="loading" uk-spinner="ratio:1.6" class="uk-margin-small-right" />
    <template v-else>
      <oc-avatar v-if="avatar" :src="avatar" class="uk-margin-small-right" width=50 height=50 />
      <template v-else>
        <oc-icon v-if="item.value.shareType === 1" class="uk-margin-small-right" name="group" size="large" />
        <oc-icon v-else class="uk-margin-small-right" name="person" size="large" />
      </template>
    </template>
    <div>
      <div class="uk-text-bold files-collaborators-autocomplete-username">{{ item.label }}</div>
      <div v-if="item.value.shareWithAdditionalInfo">{{ item.value.shareWithAdditionalInfo }}</div>
      <div class="uk-text-meta">{{ $_ocCollaborators_collaboratorType(item.value.shareType) }}</div>
    </div>
  </div>
</template>

<script>
import Mixins from './mixins'

export default {
  name: 'AutocompleteItem',
  props: ['item'],
  mixins: [Mixins],
  mounted () {
    this.$_ocCollaborators_loadAvatar(this.item)
  },
  data () {
    return {
      loading: false,
      avatar: ''
    }
  }
}
</script>

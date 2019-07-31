<template>
  <div class="uk-flex uk-flex-middle">
    <oc-avatar :src="avatar" class="uk-margin-small-right" width=50 height=50 />
    <div>
      <div class="uk-text-bold files-collaborators-autocomplete-username">{{ item.label }}</div>
      <span class="uk-text-meta">{{ $_ocCollaborators_collaboratorType(item.value.shareType) }}</span>
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
      avatar: ''
    }
  }
}
</script>

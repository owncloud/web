<template>
  <div
    :data-testid="`recipient-autocomplete-item-${item.label}`"
    class="uk-flex uk-flex-middle oc-py-xs"
    :class="collaboratorClass"
  >
    <avatar-image
      v-if="isUser"
      class="oc-mr-s"
      :width="48"
      :userid="item.value.shareWith"
      :user-name="item.label"
    />
    <oc-icon
      v-else-if="isGroup"
      key="avatar-group"
      class="oc-mr-s files-recipient-suggestion-avatar"
      name="group"
      size="xlarge"
      :accessible-label="$gettext('Group')"
    />
    <oc-icon
      v-else
      key="avatar-generic-person"
      class="oc-mr-s files-recipient-suggestion-avatar"
      name="person"
      size="xlarge"
      :accessible-label="$gettext('User')"
    />
    <div class="files-collaborators-autocomplete-user-text">
      <span class="oc-text-bold files-collaborators-autocomplete-username" v-text="item.label" />
      <span
        v-if="item.value.shareWithAdditionalInfo"
        class="oc-text-muted files-collaborators-autocomplete-additional-info"
        v-text="item.value.shareWithAdditionalInfo"
      />
      <div
        class="files-collaborators-autocomplete-share-type"
        v-text="getCollaboratorTypeLabel(item.value.shareType)"
      />
    </div>
  </div>
</template>

<script>
import { ShareType } from '../../../../helpers/share'

export default {
  name: 'AutocompleteItem',

  props: {
    item: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      loading: false
    }
  },

  computed: {
    isUser() {
      return this.item.value.shareType === ShareType.user
    },

    isGroup() {
      return this.item.value.shareType === ShareType.group
    },

    collaboratorClass() {
      const shareTypeKey = ShareType[this.item.value.shareType]
      return `files-collaborators-search-${shareTypeKey}`
    }
  },

  methods: {
    // FIXME: move to ShareType (needs to be refactored from enum to class)
    getCollaboratorTypeLabel(type) {
      switch (type) {
        case ShareType.user:
          return this.$gettext('User')
        case ShareType.group:
          return this.$gettext('Group')
        case ShareType.guest:
          return this.$gettext('Guest')
        case ShareType.remote:
          return this.$gettext('Remote user')
        default:
          return this.$gettext('Unknown type')
      }
    }
  }
}
</script>

<style lang="scss">
.vs__dropdown-option--highlight .files-recipient-suggestion-avatar svg {
  fill: white !important;
}
</style>

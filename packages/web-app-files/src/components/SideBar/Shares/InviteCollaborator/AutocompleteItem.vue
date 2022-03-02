<template>
  <div
    :data-testid="`recipient-autocomplete-item-${item.label}`"
    class="oc-flex oc-flex-middle oc-py-xs"
    :class="collaboratorClass"
  >
    <avatar-image
      v-if="isUser || isSpace"
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
        class="files-collaborators-autocomplete-additional-info"
        v-text="`(${item.value.shareWithAdditionalInfo})`"
      />
      <div class="files-collaborators-autocomplete-share-type" v-text="$gettext(shareType.label)" />
    </div>
  </div>
</template>

<script>
import { ShareTypes } from '../../../../helpers/share'

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
    shareType() {
      return ShareTypes.getByValue(this.item.value.shareType)
    },

    isUser() {
      return this.shareType === ShareTypes.user
    },

    isSpace() {
      return this.shareType === ShareTypes.space
    },

    isGroup() {
      return this.shareType === ShareTypes.group
    },

    collaboratorClass() {
      return `files-collaborators-search-${this.shareType.key}`
    }
  }
}
</script>

<style lang="scss">
.vs__dropdown-option--highlight .files-recipient-suggestion-avatar svg {
  fill: white !important;
}
</style>

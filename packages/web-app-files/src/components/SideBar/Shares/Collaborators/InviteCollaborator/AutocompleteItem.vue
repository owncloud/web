<template>
  <div
    :data-testid="`recipient-autocomplete-item-${item.label}`"
    class="oc-flex oc-flex-middle oc-py-xs"
    :class="collaboratorClass"
  >
    <avatar-image
      v-if="isUser || isSpaceUser"
      class="oc-mr-s"
      :width="32"
      :userid="item.value.shareWith"
      :user-name="item.label"
    />
    <oc-icon
      v-else-if="isGuest"
      key="avatar-guest"
      class="oc-mr-s files-recipient-suggestion-avatar"
      name="global"
      size="large"
      :accessible-label="$gettext('Guest')"
    >
    </oc-icon>
    <oc-icon
      v-else-if="isGroup || isSpaceGroup"
      key="avatar-group"
      class="oc-mr-s files-recipient-suggestion-avatar"
      name="group"
      size="large"
      :accessible-label="$gettext('Group')"
    />
    <oc-icon
      v-else
      key="avatar-generic-person"
      class="oc-mr-s files-recipient-suggestion-avatar"
      name="person"
      size="large"
      :accessible-label="$gettext('User')"
    />
    <div class="files-collaborators-autocomplete-user-text oc-text-truncate flex-column">
      <div class="files-collaborators-autocomplete-username" v-text="item.label" />
      <div
        v-if="additionalInfo"
        class="files-collaborators-autocomplete-additional-info small"
        v-text="additionalInfo"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { ShareTypes } from 'web-client/src/helpers/share'

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
    additionalInfo() {
      if (!this.item.value.shareWithAdditionalInfo) {
        return null
      }
      const infoPieces = this.item.value.shareWithAdditionalInfo.split(' ')
      if (!this.isUser) {
        return this.shareType.label
      }
      if (!infoPieces[1] || infoPieces[1] === '()') {
        return infoPieces[0]
      }
      return `${infoPieces[0]} - ${infoPieces[1].slice(1, -1)}`
    },

    shareType() {
      return ShareTypes.getByValue(this.item.value.shareType)
    },

    isUser() {
      return this.shareType === ShareTypes.user
    },

    isSpaceUser() {
      return this.shareType === ShareTypes.spaceUser
    },

    isGuest() {
      return this.shareType === ShareTypes.guest
    },

    isGroup() {
      return this.shareType === ShareTypes.group
    },

    isSpaceGroup() {
      return this.shareType === ShareTypes.spaceGroup
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
.flex-column {
  display: flex;
  flex-direction: column;
}
.small {
  font-size: 0.85rem;
}
</style>

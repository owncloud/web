<template>
  <div
    :data-testid="`recipient-autocomplete-item-${item.displayName}`"
    class="oc-flex oc-flex-middle oc-py-xs"
    :class="collaboratorClass"
  >
    <avatar-image
      v-if="isAnyUserShareType"
      class="oc-mr-s"
      :width="36"
      :userid="item.id"
      :user-name="item.displayName"
    />
    <oc-avatar-item
      v-else
      :width="36"
      :name="shareTypeKey"
      :icon="shareTypeIcon"
      icon-size="large"
      icon-color="var(--oc-color-text)"
      background="transparent"
      class="oc-mr-s"
    />
    <div class="files-collaborators-autocomplete-user-text oc-text-truncate">
      <span class="files-collaborators-autocomplete-username" v-text="item.displayName" />
      <template v-if="!isAnyPrimaryShareType">
        <span
          class="files-collaborators-autocomplete-share-type"
          v-text="`(${$gettext(shareType.label)})`"
        />
      </template>
      <div
        v-if="additionalInfo"
        class="files-collaborators-autocomplete-additionalInfo"
        v-text="`${additionalInfo}`"
      />
      <div
        v-if="externalIssuer"
        class="files-collaborators-autocomplete-externalIssuer"
        v-text="`${externalIssuer}`"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, PropType } from 'vue'
import { CollaboratorAutoCompleteItem, ShareTypes } from '@ownclouders/web-client'

export default {
  name: 'AutocompleteItem',

  props: {
    item: {
      type: Object as PropType<CollaboratorAutoCompleteItem>,
      required: true
    }
  },
  setup(props) {
    const additionalInfo = computed(() => {
      return props.item.mail || props.item.onPremisesSamAccountName
    })

    const externalIssuer = computed(() => {
      if (props.item.shareType === ShareTypes.remote.value) {
        return props.item.identities?.[0]?.issuer
      }
      return ''
    })

    return { additionalInfo, externalIssuer }
  },
  computed: {
    shareType() {
      return ShareTypes.getByValue(this.item.shareType)
    },

    shareTypeIcon() {
      return this.shareType.icon
    },

    shareTypeKey() {
      return this.shareType.key
    },

    isAnyUserShareType() {
      return ShareTypes.user.key === this.shareType.key
    },

    isAnyPrimaryShareType() {
      return [ShareTypes.user.key, ShareTypes.group.key].includes(this.shareType.key)
    },

    collaboratorClass() {
      return `files-collaborators-search-${this.shareType.key}`
    }
  }
}
</script>

<style lang="scss">
.files-collaborators-autocomplete-additionalInfo,
.files-collaborators-autocomplete-externalIssuer {
  font-size: var(--oc-font-size-small);
}
</style>

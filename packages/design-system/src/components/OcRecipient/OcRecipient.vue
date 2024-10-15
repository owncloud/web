<template>
  <span class="oc-recipient">
    <template v-if="recipient.hasAvatar">
      <oc-spinner
        v-if="recipient.isLoadingAvatar"
        key="recipient-avatar-spinner"
        size="small"
        :aria-label="$gettext('Loading avatar')"
        data-testid="recipient-avatar-spinner"
      />
      <oc-avatar
        v-else
        :key="recipient.avatar || recipient.name"
        data-testid="recipient-avatar"
        class="oc-recipient-avatar"
        :src="recipient.avatar"
        :user-name="recipient.name"
        :width="16.8"
      />
    </template>
    <oc-icon
      v-else-if="recipient.icon && recipient.icon.name"
      class="oc-recipient-icon"
      size="small"
      :name="recipient.icon.name"
      :accessible-label="recipient.icon.label"
      data-testid="recipient-icon"
    />
    <p class="oc-recipient-name" data-testid="recipient-name" v-text="recipient.name" />
    <!-- @slot Append content (actions, additional info, etc.)  -->
    <slot name="append" />
  </span>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

import OcAvatar from '../OcAvatar/OcAvatar.vue'
import OcIcon from '../OcIcon/OcIcon.vue'
import OcSpinner from '../OcSpinner/OcSpinner.vue'
import { Recipient } from '../../helpers'

export default defineComponent({
  name: 'OcRecipient',
  status: 'ready',
  release: '8.2.0',

  components: { OcAvatar, OcIcon, OcSpinner },

  props: {
    /**
     * Recipient object containing name (required), icon and avatar
     */
    recipient: {
      type: Object as PropType<Recipient>,
      required: true,
      validator: (recipient: Recipient) => {
        if (!Object.prototype.hasOwnProperty.call(recipient, 'name')) {
          throw new Error('Recipient name is not defined')
        }

        if (typeof recipient.name !== 'string') {
          throw new Error('Recipient name is not a string')
        }

        if (recipient.name.length < 1) {
          throw new Error('Recipient name is empty')
        }

        if (Object.prototype.hasOwnProperty.call(recipient, 'icon')) {
          if (!Object.prototype.hasOwnProperty.call(recipient.icon, 'name')) {
            throw new Error('Recipient icon name is not defined')
          }

          if (typeof recipient.icon.name !== 'string') {
            throw new Error('Recipient icon name is not a string')
          }

          if (recipient.icon.name.length < 1) {
            throw new Error('Recipient icon name is empty')
          }

          if (!Object.prototype.hasOwnProperty.call(recipient.icon, 'label')) {
            throw new Error('Recipient icon label is not defined')
          }

          if (typeof recipient.icon.label !== 'string') {
            throw new Error('Recipient icon label is not a string')
          }

          if (recipient.icon.label.length < 1) {
            throw new Error('Recipient icon label is empty')
          }
        }

        return true
      }
    }
  }
})
</script>

<style lang="scss">
.oc-recipient {
  align-items: center;
  background-color: var(--oc-color-background-default);
  border: 1px solid var(--oc-color-input-border);
  border-radius: 6px;
  display: flex;
  gap: var(--oc-space-xsmall);
  justify-content: flex-start;
  padding: var(--oc-space-xsmall);
  width: auto;

  &-icon > svg {
    fill: var(--oc-color-text-default);
  }

  &-name {
    color: var(--oc-color-text-default);
    margin: 0;
    padding: 0;
  }
}
</style>

<docs>
```js
<div class="oc-flex oc-flex-column oc-flex-left oc-flex-top">
  <oc-recipient :recipient="{ name: 'Alice', avatar: 'https://picsum.photos/24', hasAvatar: true, isAvatarLoading: false }" class="oc-mb-s" />
  <oc-recipient :recipient="{ name: 'Alice', icon: { name: 'person', label: 'User' }, hasAvatar: false }" />
</div>
```
</docs>

<template>
  <span>
    <span
      v-oc-tooltip="tooltip"
      class="oc-avatars"
      :class="{ 'oc-avatars-stacked': stacked }"
      aria-hidden="true"
    >
      <template v-if="avatars.length > 0">
        <oc-avatar
          v-for="avatar in avatars"
          :key="avatar.username"
          :src="avatar.avatar"
          :user-name="avatar.displayName"
          :width="30"
        />
      </template>
      <template v-if="otherItems.length > 0">
        <component
          :is="getAvatarComponentForItem(item)"
          v-for="(item, index) in otherItems"
          :key="item.name + index"
          :name="item.name"
        />
      </template>
      <oc-avatar-count v-if="isOverlapping" :count="items.length - maxDisplayed" />
    </span>
    <span v-if="accessibleDescription" class="oc-invisible-sr" v-text="accessibleDescription" />
  </span>
</template>

<script lang="ts">
import { shareType } from '../../utils/shareType'
import OcAvatar from '../OcAvatar/OcAvatar.vue'
import OcAvatarCount from '../OcAvatarCount/OcAvatarCount.vue'
import OcAvatarLink from '../OcAvatarLink/OcAvatarLink.vue'
import OcAvatarGroup from '../OcAvatarGroup/OcAvatarGroup.vue'
import OcAvatarFederated from '../OcAvatarFederated/OcAvatarFederated.vue'
import OcAvatarGuest from '../OcAvatarGuest/OcAvatarGuest.vue'
import { defineComponent, PropType } from 'vue'

type Item = {
  displayName?: string
  name?: string
  shareType?: number
  username?: string
  avatar?: string
}

/**
 * Display a group of avatars
 */
export default defineComponent({
  name: 'OcAvatars',
  status: 'ready',
  release: '2.1.0',

  components: {
    OcAvatar,
    OcAvatarCount,
    OcAvatarLink,
    OcAvatarGroup,
    OcAvatarFederated,
    OcAvatarGuest
  },

  props: {
    /**
     * Users, public links, groups, federated and guests to be displayed with avatars
     */
    items: {
      type: Array as PropType<Item[]>,
      required: true
    },
    /**
     * Asserts whether avatars should be stacked on each other
     */
    stacked: {
      type: Boolean,
      required: false,
      default: false
    },
    /**
     * Asserts whether tooltip should be displayed on hover/focus
     */
    isTooltipDisplayed: {
      type: Boolean,
      required: false,
      default: false
    },
    /**
     * Limits the number of avatars which will be displayed
     */
    maxDisplayed: {
      type: Number,
      required: false,
      default: null
    },
    /**
     * A description of the avatar group for screen readers. This is required as the avatar group element
     * is hidden for screen readers.
     */
    accessibleDescription: {
      type: String,
      required: false,
      default: null
    }
  },

  computed: {
    isOverlapping() {
      return this.maxDisplayed && this.maxDisplayed < this.items.length
    },

    tooltip() {
      if (this.isTooltipDisplayed) {
        const names = this.avatars.map((user) => user.displayName)

        if (this.otherItems.length > 0) {
          names.push(...this.otherItems.map((item) => item.name))
        }

        let tooltip = names.join(', ')

        if (this.isOverlapping) {
          tooltip += ` +${this.items.length - this.maxDisplayed}`
        }

        return tooltip
      }

      return null
    },

    avatars() {
      const a = this.items.filter((u) => u.shareType === shareType.user)
      if (!this.isOverlapping) {
        return a
      }
      return a.slice(0, this.maxDisplayed)
    },

    otherItems() {
      const a = this.items.filter((u) => u.shareType !== shareType.user)
      if (!this.isOverlapping) {
        return a
      }
      if (this.maxDisplayed <= this.avatars.length) {
        return []
      }
      return a.slice(0, this.maxDisplayed - this.avatars.length)
    }
  },
  methods: {
    getAvatarComponentForItem(item: Item) {
      switch (item.shareType) {
        case shareType.link:
          return OcAvatarLink
        case shareType.remote:
          return OcAvatarFederated
        case shareType.group:
          return OcAvatarGroup
        case shareType.guest:
          return OcAvatarGuest
      }
    }
  }
})
</script>

<style lang="scss">
.oc-avatars {
  display: inline-flex;
  box-sizing: border-box;
  flex-flow: row nowrap;
  gap: var(--oc-space-xsmall);
  width: fit-content;

  &-stacked {
    .oc-avatar + .oc-avatar,
    .oc-avatar-count,
    .oc-avatar + .oc-avatar-item,
    .oc-avatar-item + .oc-avatar-item {
      border: 1px solid var(--oc-color-inverseOnSurface);
      margin-left: -25px;
    }
  }
}
</style>

<docs>
```js
<template>
  <div>
    <h3>Default configuration</h3>
    <p>No stacking, no tooltip, no <b>:maxDisplayed</b> configured</p>
    <oc-avatars :items="items" accessible-description="This resource is shared with many users." class="oc-mb" />
    <h3>Stacked, tooltip, maxDisplayed</h3>
    <p>Using <b>:stacked="true"</b>, <b>:isTooltipDisplayed="true"</b> and <b>:maxDisplayed="5"</b></p>
    <oc-avatars :items="items" accessible-description="This resource is shared with many users." :stacked="true" :maxDisplayed="5" :isTooltipDisplayed="true" />
    <h3>Unstacked, tooltip, maxDisplayed</h3>
    <p>Using <b>:isTooltipDisplayed="true"</b> and <b>:maxDisplayed="2"</b></p>
    <oc-avatars :items="items" accessible-description="This resource is shared with many users." :maxDisplayed="2" :isTooltipDisplayed="true" />
  </div>
</template>
<script>
import { shareType } from "../../utils/shareType"
export default {
  data: () => ({
    items: [
      {
        name: "bob",
        shareType: shareType.remote
      },
      {
        username: "marie",
        displayName: "Marie",
        avatar: "https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?ixid=MXwxMjA3fDB8MHxzZWFyY2h8Mzh8fGZhY2V8ZW58MHwyfDB8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
        shareType: shareType.user
      },
      {
        username: "peter",
        displayName: "Peter",
        avatar: "https://images.unsplash.com/photo-1610216705422-caa3fcb6d158?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MTB8fGZhY2V8ZW58MHwyfDB8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
        shareType: shareType.user
      },
      {
        username: "udo",
        displayName: "Udo",
        avatar: "https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?ixid=MXwxMjA3fDB8MHxzZWFyY2h8Mzh8fGZhY2V8ZW58MHwyfDB8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
        shareType: shareType.user
      },
      {
        name: "john",
        shareType: shareType.guest
      },
      {
        name: "Public link",
        shareType: shareType.link
      },
      {
        name: "Test",
        shareType: shareType.group
      }
    ]
  })
}
</script>
```
</docs>
